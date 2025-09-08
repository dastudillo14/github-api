import { Logger } from '@nestjs/common';

export function LogExecution(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const logger = new Logger(context || target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const methodName = `${target.constructor.name}.${propertyName}`;
      
      logger.log(`Starting ${methodName}`);
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        logger.log(`Successfully completed ${methodName} - Duration: ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        if (error.status) {
          logger.warn(`${methodName} failed with HttpException - Status: ${error.status}, Duration: ${duration}ms`);
        } else {
          logger.error(`${methodName} failed with unexpected error - Duration: ${duration}ms`, error.stack);
        }
        
        throw error;
      }
    };
  };
}
