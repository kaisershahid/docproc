import { LexemeDef } from "../../types";
import { BaseHandler } from "./base";
/**
 * Used to collect tokens for plaintext output.
 */
export declare class DefaultParentHandler extends BaseHandler {
    canAccept(lexeme: string): boolean;
    getName(): string;
    push(lexeme: string, def: LexemeDef | undefined): any;
}
