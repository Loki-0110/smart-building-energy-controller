
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
public class SnowflakeETLService {

    private static final Logger log =
            LoggerFactory.getLogger(SnowflakeETLService.class);

    // Reuse the existing Python environment configuration.
    @Value("${energy.python.executable}")
    private String pythonExecutable;

    @Value("${energy.python.working-directory}")
    private String workingDirectory;

    // Separate script and timeout for Snowflake ETL.
    @Value("${energy.etl.script:run_etl.py}")
    private String etlScript;

    @Value("${energy.etl.timeout-minutes:15}")
    private long timeoutMinutes;

    public void executeSnowflakeETL() {

        Path workingPath = Path.of(workingDirectory)
                .toAbsolutePath().normalize();

        Path pythonPath = workingPath.resolve(pythonExecutable)
                .normalize();

        Path scriptPath = workingPath.resolve(etlScript)
                .normalize();

        if (!Files.isDirectory(workingPath)) {
            throw new IllegalStateException(
                    "Python working directory not found: " + workingPath);
        }

        if (!Files.isRegularFile(pythonPath)) {
            throw new IllegalStateException(
                    "Python executable not found: " + pythonPath);
        }

        if (!Files.isRegularFile(scriptPath)) {
            throw new IllegalStateException(
                    "Snowflake ETL script not found: " + scriptPath);
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
            log.info("Starting Snowflake ETL...");
            log.info("Python executable: {}", pythonPath);
            log.info("ETL script: {}", scriptPath);

            process = processBuilder.start();

            boolean completed = process.waitFor(
                    timeoutMinutes, TimeUnit.MINUTES);

            if (!completed) {
                process.destroyForcibly();
                process.waitFor();

                throw new IllegalStateException(
                        "Snowflake ETL timed out after "
                                + timeoutMinutes + " minutes");
            }

            int exitCode = process.exitValue();

            if (exitCode != 0) {
                throw new IllegalStateException(
                        "Snowflake ETL failed. Exit code: " + exitCode);
            }

            log.info("Snowflake ETL completed successfully.");

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to start Snowflake ETL Python process", e);

        } catch (InterruptedException e) {
            if (process != null) {
                process.destroyForcibly();
            }

            Thread.currentThread().interrupt();

            throw new IllegalStateException(
                    "Snowflake ETL was interrupted", e);
        }
    }
}
