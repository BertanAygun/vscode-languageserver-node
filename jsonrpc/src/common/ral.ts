/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { Disposable } from './disposable';
import { ContentTypeEncoder, ContentTypeDecoder } from './encoding';

interface _MessageBuffer {

	readonly encoding: RAL.MessageBufferEncoding;

	/**
	 * Append data to the message buffer.
	 *
	 * @param chunk the data to append.
	 */
	append(chunk: Uint8Array | string): void;

	/**
	 * Tries to read the headers from the buffer
	 *
	 * @returns the header properties or undefined in not enough data can be read.
	 */
	tryReadHeaders(): Map<string, string> | undefined;

	/**
	 * Tries to read the body of the given length.
	 *
	 * @param length the amount of bytes to read.
	 * @returns the data or undefined int less data is available.
	 */
	tryReadBody(length: number): Uint8Array | undefined;
}

type _MessageBufferEncoding = 'ascii' | 'utf-8';

interface _ReadableStream {
	onData(listener: (data: Uint8Array) => void): Disposable;
	onClose(listener: () => void): Disposable;
	onError(listener: (error: any) => void): Disposable;
	onEnd(listener: () => void): Disposable;
}

interface _WritableStream {
	onClose(listener: () => void): Disposable;
	onError(listener: (error: any) => void): Disposable;
	onEnd(listener: () => void): Disposable;
	write(data: Uint8Array): Promise<void>;
	write(data: string, encoding: _MessageBufferEncoding): Promise<void>;
	end(): void;
}

interface _DuplexStream extends _ReadableStream, _WritableStream {
}

interface RAL {

	readonly applicationJson: {
		readonly encoder: ContentTypeEncoder;
		readonly decoder: ContentTypeDecoder;
	};

	readonly messageBuffer: {
		readonly create: (encoding: RAL.MessageBufferEncoding) => RAL.MessageBuffer;
	}
}

let _ral: RAL | undefined;

function RAL(): RAL {
	if (_ral === undefined) {
		throw new Error(`No runtime abstraction layer installed`);
	}
	return _ral;
}

namespace RAL {
	export type MessageBuffer = _MessageBuffer;
	export type MessageBufferEncoding = _MessageBufferEncoding;
	export type ReadableStream = _ReadableStream;
	export type WritableStream = _WritableStream;
	export type DuplexStream = _DuplexStream;
	export function install(ral: RAL): void {
		if (ral === undefined) {
			throw new Error(`No runtime abstraction layer provided`);
		}
		_ral = ral;
	}
}

export default RAL;