import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

import Glob from 'glob';

import reactDocgen, { Handler } from 'react-docgen';

import {
  assert,
  object,
  union,
  string,
  size,
  array,
  optional,
  boolean,
  func,
  tuple,
  pattern,
} from 'superstruct';

import { ParserOptions } from '@babel/parser';
import { Plugin, OptionValidationContext, DocusaurusContext, RouteConfig } from '@docusaurus/types';
import { asyncMap } from './utils';

type Route = Pick<RouteConfig, 'exact' | 'component' | 'path' | 'priority'>;

type Union =
  | {
      global?: undefined | false;
      route: Route;
    }
  | {
      global: boolean;
      route?: Route;
    };

type Options = Union & {
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

const glob = promisify(Glob);
const readFile = promisify(fs.readFile);

export default function plugin(
  context: DocusaurusContext,
  { src, global = false, route, docgen = {}, babel = {}, parserOptions }: Options
): Plugin<{ file: string; docgen: Record<any, any> }[]> {
  return {
    name: 'docusaurus-plugin-react-docgen',
    async loadContent() {
      const fileOpts: { encoding: BufferEncoding } = { encoding: 'utf-8' };
      const files = await glob(Array.isArray(src) ? src.join(',') : src);

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
    async contentLoaded({ content, actions }): Promise<void> {
      const re = /\.[jt]sx?/gi;
      const { createData, setGlobalData, addRoute } = actions;

      const data: Record<string, any> = content.reduce((acc, { file, docgen }) => {
        acc[path.basename(file).toLowerCase().replace(re, '')] = docgen;

        return acc;
      }, {});

      if (global) {
        console.warn(
          'Using global data can potentially slow down your entire app. Use with care ❤️'
        );

        setGlobalData(data);
      } else {
        addRoute({
          ...route,
          modules: {
            docgen: await createData('docgen.json', JSON.stringify(data)),
          },
        });
      }
    },
  };
}

export const validateOptions = ({ options }: OptionValidationContext<Options, boolean>) => {
  return assert(
    options,
    object({
      src: union([size(array(string()), 1), string()]),
      route: optional(object()),
      global: optional(boolean()),
      docgen: object({
        resolver: func(),
        handlers: union([func(), size(array(func()), 1)]),
      }),
      babel: object({
        babelrc: boolean(),
        babelrcRoots: tuple([boolean(), string(), size(array(string()), 1)]),
        root: string(),
        envName: string(),
        rootMode: pattern(string(), /root|upward|upward-optional/),
        configFile: tuple([string(), boolean()]),
      }),
    })
  );
};
