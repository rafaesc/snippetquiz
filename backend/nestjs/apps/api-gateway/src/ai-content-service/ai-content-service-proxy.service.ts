import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import { envs } from '../config/envs';
import { X_USER_ID_HEADER } from 'apps/commons/config/constants';

export interface ProxyRequestOptions {
    userId: string;
    path: string;
    payload?: any;
    queryParameters?: Record<string, any>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

@Injectable()
export class AiContentServiceProxyService {
    private readonly logger = new Logger(AiContentServiceProxyService.name);
    private readonly baseUrl: string;

    constructor(private readonly httpService: HttpService) {
        this.baseUrl = envs.aiContentServiceBaseUrl;
    }

    async handleProxy(req: FastifyRequest, res: FastifyReply): Promise<void> {
        try {
            // Extract userId from JWT token (assuming it's in req.user after JwtAuthGuard)
            const userId = (req as any).user?.id || (req as any).user?.userId;

            if (!userId) {
                throw new HttpException(
                    'User ID not found in token',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const pathPrefix = '/api/ai-content';
            // Extract the path after the specified prefix
            const path = req.url.replace(new RegExp(`^${pathPrefix}/?`), '') || '';

            // Get query parameters
            const queryParameters = req.query as Record<string, any>;

            // Get request body
            const payload = req.body;

            // Use the proxy service to forward the request
            const response = await this.proxyRequest({
                userId: userId.toString(),
                path,
                payload: payload && Object.keys(payload).length > 0 ? payload : undefined,
                queryParameters:
                    Object.keys(queryParameters).length > 0 ? queryParameters : undefined,
                method: req.method as any,
            });

            res.status(200).send(response);
        } catch (error) {
            if (error instanceof HttpException) {
                res.status(error.getStatus()).send({
                    message: error.message,
                    statusCode: error.getStatus(),
                });
            } else {
                res.status(500).send({
                    message: 'Internal server error',
                    statusCode: 500,
                });
            }
        }
    }

    async proxyRequest<T = any>(options: ProxyRequestOptions): Promise<T> {
        const { userId, path, payload, queryParameters, method = 'GET' } = options;

        try {
            const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;

            const headers = {
                [X_USER_ID_HEADER]: userId,
                'Content-Type': 'application/json',
            };

            const config = {
                headers,
                params: queryParameters,
            };

            this.logger.debug(`Proxying ${method} request to: ${url}`);
            this.logger.debug(`Headers: ${JSON.stringify(headers)}`);

            let response;

            switch (method) {
                case 'GET':
                    response = await firstValueFrom(this.httpService.get(url, config));
                    break;
                case 'POST':
                    response = await firstValueFrom(
                        this.httpService.post(url, payload, config),
                    );
                    break;
                case 'PUT':
                    response = await firstValueFrom(
                        this.httpService.put(url, payload, config),
                    );
                    break;
                case 'DELETE':
                    response = await firstValueFrom(this.httpService.delete(url, config));
                    break;
                case 'PATCH':
                    response = await firstValueFrom(
                        this.httpService.patch(url, payload, config),
                    );
                    break;
                default:
                    throw new HttpException(
                        `Unsupported HTTP method: ${method}`,
                        HttpStatus.BAD_REQUEST,
                    );
            }

            return response.data;
        } catch (error) {
            this.logger.error(`Proxy request failed: ${error.message}`, error.stack);

            if (error.response) {
                // Forward the error from the microservice
                throw new HttpException(
                    error.response.data || 'Microservice error',
                    error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            throw new HttpException(
                'Failed to communicate with ai-content service',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }

    // Convenience methods for common HTTP operations
    async get<T = any>(
        userId: string,
        path: string,
        queryParameters?: Record<string, any>,
    ): Promise<T> {
        return this.proxyRequest<T>({
            userId,
            path,
            queryParameters,
            method: 'GET',
        });
    }

    async post<T = any>(
        userId: string,
        path: string,
        payload?: any,
        queryParameters?: Record<string, any>,
    ): Promise<T> {
        return this.proxyRequest<T>({
            userId,
            path,
            payload,
            queryParameters,
            method: 'POST',
        });
    }

    async put<T = any>(
        userId: string,
        path: string,
        payload?: any,
        queryParameters?: Record<string, any>,
    ): Promise<T> {
        return this.proxyRequest<T>({
            userId,
            path,
            payload,
            queryParameters,
            method: 'PUT',
        });
    }

    async delete<T = any>(
        userId: string,
        path: string,
        queryParameters?: Record<string, any>,
    ): Promise<T> {
        return this.proxyRequest<T>({
            userId,
            path,
            queryParameters,
            method: 'DELETE',
        });
    }

    async patch<T = any>(
        userId: string,
        path: string,
        payload?: any,
        queryParameters?: Record<string, any>,
    ): Promise<T> {
        return this.proxyRequest<T>({
            userId,
            path,
            payload,
            queryParameters,
            method: 'PATCH',
        });
    }
}
