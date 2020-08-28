import fs from 'fs';
import path from 'path';

import globby from 'globby';
import { promisify } from 'util';

import Joi from '@hapi/joi';
import reactDocgen from 'react-docgen';

import { ParserOptions } from '@babel/parser';
import { Plugin, OptionValidationContext, DocusaurusContext } from '@docusaurus/types';
import { asyncMap } from './utils';

type Handler = (doc: any, definition: any, parser: { parse: (s: string) => {} }) => void;

type Options = {
    src: string | string[];
    docgen?: {
        /**
         * See react-docgen docs
         * @see https://github.com/reactjs/react-docgen#resolver
         */
        resolver?: (ast: Record<any, any>) => any;

        /**
         * See react-docgen docs
         * @see https://github.com/reactjs/react-docgen#handlers
         */
        handlers?: Handler[];
    };
    parserOptions?: ParserOptions;
    babel?: {
        babelrc?: boolean;
        babelrcRoots?: boolean | string | string[];
        root?: string;
        rootMode?: 'root' | 'upward' | 'upward-optional';
        envName?: string;
        configFile?: string | boolean;
    };
};

const readFile = promisify(fs.readFile);

export default function plugin(
    context: DocusaurusContext,
    { src, docgen = {}, babel = {}, parserOptions }: Options
): Plugin<{ file: string; docgen: Record<any, any> }[]> {
    return {
        name: 'docusaurus-plugin-react-docgen',
        async loadContent() {
            const fileOpts: { encoding: BufferEncoding } = { encoding: 'utf-8' };
            const files = await globby(src);

            return (
                await asyncMap(files, async file => {
                    try {
                        return {
                            docgen: reactDocgen.parse(
                                await readFile(file, fileOpts),
                                docgen.resolver,
                                docgen.handlers,
                                {
                                    filename: file,
                                    parserOptions,
                                    ...babel,
                                }
                            ),
                            file,
                        };
                    } catch (e) {
                        console.warn(e.message, file);
                    }
                })
            ).filter(Boolean);
        },
        async contentLoaded({ content, actions }) {
            const re = /(?:\.d)?\.[jt]sx?$/gi;
            const { createData } = actions;

            for (let i = 0; i < content.length; i++) {
                await createData(
                    path.basename(content[i].file.toLowerCase()).replace(re, '.json'),
                    JSON.stringify(content[i].docgen)
                );
            }
        },
    };
}

export const validateOptions = ({ options, validate }: OptionValidationContext<Options>) => {
    return validate(
        Joi.object({
            src: Joi.alternatives(Joi.string(), Joi.array().min(1).items(Joi.string())).required(),
            docgen: Joi.object({
                resolver: Joi.object().instance(Function),
                handlers: Joi.alternatives(
                    Joi.object().instance(Function),
                    Joi.array().min(1).items(Joi.object().instance(Function))
                ),
            }),
            babel: Joi.object({
                babelrc: Joi.boolean(),
                babelrcRoots: [Joi.boolean(), Joi.string(), Joi.array().items(Joi.string())],
                root: Joi.string(),
                rootMode: Joi.string().pattern(/root | upward | upward-optional/),
                envName: Joi.string(),
                configFile: [Joi.string(), Joi.boolean()],
            }),
        }),
        options
    );
};
