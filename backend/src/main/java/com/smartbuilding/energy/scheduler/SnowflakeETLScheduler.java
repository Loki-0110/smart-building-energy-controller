
package com.smartbuilding.energy.scheduler;

import com.smartbuilding.energy.service.SnowflakeETLService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicBoolean;

@Component
@ConditionalOnProperty(
        name = "energy.etl.scheduler.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class SnowflakeETLScheduler {

    private static final Logger log =
            LoggerFactory.getLogger(SnowflakeETLScheduler.class);

    private final SnowflakeETLService snowflakeETLService;

    private final AtomicBoolean running = new AtomicBoolean(false);

    public SnowflakeETLScheduler(
            SnowflakeETLService snowflakeETLService) {
        this.snowflakeETLService = snowflakeETLService;
    }

    @Scheduled(
            fixedDelayString =
                    "${energy.etl.scheduler.fixed-delay:1200000}",
            initialDelayString =
                    "${energy.etl.scheduler.initial-delay:120000}"
    )
    public void runSnowflakeETL() {

        if (!running.compareAndSet(false, true)) {
            log.warn("Previous Snowflake ETL is still running. Skipping cycle.");
            return;
        }

        log.info("========== SNOWFLAKE ETL CYCLE STARTED ==========");

        try {
            snowflakeETLService.executeSnowflakeETL();

            log.info("========== SNOWFLAKE ETL CYCLE SUCCESSFUL ==========");

        } catch (Exception e) {
            log.error("========== SNOWFLAKE ETL CYCLE FAILED ==========", e);

        } finally {
            running.set(false);
        }
    }
}
