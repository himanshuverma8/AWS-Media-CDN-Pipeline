// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
// UPDATED: Support for user-specific paths (users/{userId}/images/...)

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import Sharp from 'sharp';

const s3Client = new S3Client();
const S3_ORIGINAL_IMAGE_BUCKET = process.env.originalImageBucketName;
const S3_TRANSFORMED_IMAGE_BUCKET = process.env.transformedImageBucketName;
const TRANSFORMED_IMAGE_CACHE_TTL = process.env.transformedImageCacheTTL;
const MAX_IMAGE_SIZE = parseInt(process.env.maxImageSize);

export const handler = async (event) => {
    // Validate if this is a GET request
    if (!event.requestContext || !event.requestContext.http || !(event.requestContext.http.method === 'GET')) {
        return sendError(400, 'Only GET method is supported', event);
    }
    
    // ============================================
    // HANDLE /files/ PATH (Non-image files)
    // Supports: /files/{userId}/folder/file.pdf
    // Maps to: users/{userId}/files/folder/file.pdf
    // ============================================
    if (event.requestContext.http.path.startsWith('/files/')) {
        const requestPath = event.requestContext.http.path;
        const pathWithoutSlash = requestPath.replace(/^\//, '');
        const pathParts = pathWithoutSlash.split('/');
        
        // New user-specific path: /files/{userId}/folder/file.pdf
        if (pathParts.length >= 2 && pathParts[0] === 'files') {
            const userId = pathParts[1];
            const filePath = pathParts.slice(2).join('/');
            
            // Construct S3 key: users/{userId}/files/{filePath}
            const s3Key = `users/${userId}/files/${filePath}`;
            
            // Try user-specific path first, then fallbacks for backward compatibility
            const candidateKeys = [
                s3Key, // users/abc-123/files/folder/file.pdf
                pathWithoutSlash, // files/abc-123/folder/file.pdf
                pathWithoutSlash.replace(/^files\//, '') // abc-123/folder/file.pdf
            ];
            
            for (const candidateKey of candidateKeys) {
                try {
                    const data = await s3Client.send(new GetObjectCommand({ 
                        Bucket: S3_ORIGINAL_IMAGE_BUCKET, 
                        Key: candidateKey 
                    }));
                    const body = await data.Body.transformToByteArray();
                    return {
                        statusCode: 200,
                        isBase64Encoded: true,
                        body: Buffer.from(body).toString('base64'),
                        headers: {
                            'Content-Type': data.ContentType ?? 'application/octet-stream',
                            'Cache-Control': 'public, max-age=31536000'
                        }
                    };
                } catch (e) {
                    if (e.name === 'NoSuchKey') {
                        continue;
                    }
                    return { statusCode: 500, body: 'S3 error' };
                }
            }
            return { statusCode: 404, body: 'Not found' };
        }
        
        // Fallback for old paths (backward compatibility)
        const keyWithPrefix = pathWithoutSlash;
        const keyWithoutPrefix = keyWithPrefix.replace(/^files\//, '');
        const candidateKeys = [keyWithPrefix, keyWithoutPrefix];
        for (const candidateKey of candidateKeys) {
            try {
                const data = await s3Client.send(new GetObjectCommand({ 
                    Bucket: S3_ORIGINAL_IMAGE_BUCKET, 
                    Key: candidateKey 
                }));
                const body = await data.Body.transformToByteArray();
                return {
                    statusCode: 200,
                    isBase64Encoded: true,
                    body: Buffer.from(body).toString('base64'),
                    headers: {
                        'Content-Type': data.ContentType ?? 'application/octet-stream',
                        'Cache-Control': 'public, max-age=31536000'
                    }
                };
            } catch (e) {
                if (e.name === 'NoSuchKey') {
                    continue;
                }
                return { statusCode: 500, body: 'S3 error' };
            }
        }
        return { statusCode: 404, body: 'Not found' };
    }
    
    // ============================================
    // HANDLE /images/ PATH (Image files with transformations)
    // Supports: /images/{userId}/folder/image.jpg/format=webp,width=500
    // Maps to: users/{userId}/images/folder/image.jpg
    // ============================================
    // Expected path: /images/{userId}/folder/image.jpg/format=webp,width=500
    var imagePathArray = event.requestContext.http.path.split('/');
    
    // Get the requested image operations (last element)
    var operationsPrefix = imagePathArray.pop();
    
    // Remove first empty element (from leading slash)
    imagePathArray.shift();
    
    // Now we have: ['images', 'userId', 'folder', 'image.jpg']
    // Remove 'images' prefix
    if (imagePathArray[0] === 'images') {
        imagePathArray.shift();
    }
    
    // Now we have: ['userId', 'folder', 'image.jpg']
    // First element is userId, rest is folder/file path
    var userId = imagePathArray[0];
    var folderPath = imagePathArray.slice(1).join('/');
    
    // Construct S3 key: users/{userId}/images/{folderPath}
    var originalImagePath = `users/${userId}/images/${folderPath}`;

    var startTime = performance.now();
    
    // Downloading original image
    let originalImageBody;
    let contentType;
    try {
        const getOriginalImageCommand = new GetObjectCommand({ 
            Bucket: S3_ORIGINAL_IMAGE_BUCKET, 
            Key: originalImagePath 
        });
        const getOriginalImageCommandOutput = await s3Client.send(getOriginalImageCommand);
        console.log(`Got response from S3 for ${originalImagePath}`);

        originalImageBody = getOriginalImageCommandOutput.Body.transformToByteArray();
        contentType = getOriginalImageCommandOutput.ContentType;
    } catch (error) {
        if (error.name === "NoSuchKey") {
            return sendError(404, "The requested image does not exist", error);
        }
        return sendError(500, 'Error downloading original image', error);
    }
    
    let transformedImage = Sharp(await originalImageBody, { failOn: 'none', animated: true });
    
    // Get image orientation to rotate if needed
    const imageMetadata = await transformedImage.metadata();
    
    // Execute the requested operations 
    const operationsJSON = Object.fromEntries(operationsPrefix.split(',').map(operation => operation.split('=')));
    
    // Variable holding the server timing header value
    var timingLog = 'img-download;dur=' + parseInt(performance.now() - startTime);
    startTime = performance.now();
    
    try {
        // Check if resizing is requested
        var resizingOptions = {};
        if (operationsJSON['width']) resizingOptions.width = parseInt(operationsJSON['width']);
        if (operationsJSON['height']) resizingOptions.height = parseInt(operationsJSON['height']);
        if (resizingOptions.width || resizingOptions.height) {
            transformedImage = transformedImage.resize(resizingOptions);
        }
        
        // Check if rotation is needed
        if (imageMetadata.orientation) transformedImage = transformedImage.rotate();
        
        // Check if formatting is requested
        if (operationsJSON['format']) {
            var isLossy = false;
            switch (operationsJSON['format']) {
                case 'jpeg': contentType = 'image/jpeg'; isLossy = true; break;
                case 'gif': contentType = 'image/gif'; break;
                case 'webp': contentType = 'image/webp'; isLossy = true; break;
                case 'png': contentType = 'image/png'; break;
                case 'avif': contentType = 'image/avif'; isLossy = true; break;
                default: contentType = 'image/jpeg'; isLossy = true;
            }
            if (operationsJSON['quality'] && isLossy) {
                transformedImage = transformedImage.toFormat(operationsJSON['format'], {
                    quality: parseInt(operationsJSON['quality']),
                });
            } else {
                transformedImage = transformedImage.toFormat(operationsJSON['format']);
            }
        } else {
            // If no format is specified, Sharp converts svg to png by default
            if (contentType === 'image/svg+xml') contentType = 'image/png';
        }
        transformedImage = await transformedImage.toBuffer();
    } catch (error) {
        return sendError(500, 'error transforming image', error);
    }
    timingLog = timingLog + ',img-transform;dur=' + parseInt(performance.now() - startTime);

    // Handle gracefully generated images bigger than a specified limit
    const imageTooBig = Buffer.byteLength(transformedImage) > MAX_IMAGE_SIZE;

    // Upload transformed image back to S3 if required
    if (S3_TRANSFORMED_IMAGE_BUCKET) {
        startTime = performance.now();
        try {
            const putImageCommand = new PutObjectCommand({
                Body: transformedImage,
                Bucket: S3_TRANSFORMED_IMAGE_BUCKET,
                Key: originalImagePath + '/' + operationsPrefix, // This now includes users/ prefix
                ContentType: contentType,
                CacheControl: TRANSFORMED_IMAGE_CACHE_TTL,
            })
            await s3Client.send(putImageCommand);
            timingLog = timingLog + ',img-upload;dur=' + parseInt(performance.now() - startTime);
            
            // If the generated image file is too big, send a redirection to the generated image on S3
            if (imageTooBig) {
                // Convert S3 path back to CDN path for redirect
                // S3: users/abc-123/images/folder/image.jpg
                // CDN: images/abc-123/folder/image.jpg
                var cdnPath = originalImagePath.replace(/^users\/[^\/]+\//, '');
                
                return {
                    statusCode: 302,
                    headers: {
                        'Location': '/' + cdnPath + '?' + operationsPrefix.replace(/,/g, "&"),
                        'Cache-Control': 'private,no-store',
                        'Server-Timing': timingLog
                    }
                };
            }
        } catch (error) {
            logError('Could not upload transformed image to S3', error);
        }
    }

    // Return error if the image is too big and a redirection was not possible
    if (imageTooBig) {
        return sendError(403, 'Requested transformed image is too big', '');
    } else {
        return {
            statusCode: 200,
            body: transformedImage.toString('base64'),
            isBase64Encoded: true,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': TRANSFORMED_IMAGE_CACHE_TTL,
                'Server-Timing': timingLog
            }
        };
    }
};

function sendError(statusCode, body, error) {
    logError(body, error);
    return { statusCode, body };
}

function logError(body, error) {
    console.log('APPLICATION ERROR', body);
    console.log(error);
}
