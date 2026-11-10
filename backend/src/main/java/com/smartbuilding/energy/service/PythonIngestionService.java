
package com.smartbuilding.energy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class PythonIngestionService {

    private static final Logger log =
            LoggerFactory.getLogger(PythonIngestionService.class);

    @Value("${energy.python.executable}")
    private String pythonExecutable;

    @Value("${energy.python.script}")
    private String pythonScript;

    @Value("${energy.python.working-directory}")
    private String workingDirectory;

    @Value("${energy.python.timeout-minutes:3}")
    private long timeoutMinutes;

    public void executePythonIngestion() {

        Path workingPath = Path.of(workingDirectory)
                .toAbsolutePath().normalize();

        Path pythonPath = workingPath.resolve(pythonExecutable)
                .normalize();

        Path scriptPath = workingPath.resolve(pythonScript)
                .normalize();

        if (!Files.isDirectory(workingPath)) {
            throw new IllegalStateException(
                    "Python working directory not found: " + workingPath
            );
        }

        if (!Files.isRegularFile(pythonPath)) {
            throw new IllegalStateException(
                    "Python executable not found: " + pythonPath
            );
        }

        if (!Files.isRegularFile(scriptPath)) {
            throw new IllegalStateException(
                    "Python script not found: " + scriptPath
            );
        }

        ProcessBuilder processBuilder = new ProcessBuilder(
                pythonPath.toString(),
                scriptPath.toString()
        );

        processBuilder.directory(workingPath.toFile());
        processBuilder.redirectErrorStream(true);
        processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);

        Process process = null;

        try {
            log.info("Starting Python meter ingestion...");
            log.info("Python executable: {}", pythonPath);
            log.info("Python script: {}", scriptPath);

            process = processBuilder.start();

            boolean completed = process.waitFor(
                    timeoutMinutes, TimeUnit.MINUTES
            );

            if (!completed) {
                process.destroyForcibly();

                throw new IllegalStateException(
                        "Python ingestion timed out after "
                                + timeoutMinutes + " minutes"
                );
            }

            int exitCode = process.exitValue();

            if (exitCode != 0) {
                throw new IllegalStateException(
                        "Python ingestion failed. Exit code: " + exitCode
                );
            }

            log.info("Python meter ingestion completed successfully.");

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to start Python process", e
            );

        } catch (InterruptedException e) {
            if (process != null) {
                process.destroyForcibly();
            }

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Python ingestion was interrupted", e
            );
        }
    }
}
