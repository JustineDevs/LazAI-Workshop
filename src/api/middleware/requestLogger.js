const requestLogger = (logger) => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Log request
        logger.info('Request received', {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });

        // Override res.end to log response
        const originalEnd = res.end;
        res.end = function(chunk, encoding) {
            const duration = Date.now() - startTime;
            
            logger.info('Response sent', {
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                contentLength: res.get('Content-Length') || 0,
                timestamp: new Date().toISOString()
            });

            // Call original end method
            originalEnd.call(this, chunk, encoding);
        };

        next();
    };
};

module.exports = requestLogger;
