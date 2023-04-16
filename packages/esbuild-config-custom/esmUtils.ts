/*
 * Copyright (c) 2023, Terwer . All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Terwer designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Terwer in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Terwer, Shenzhen, Guangdong, China, youweics@163.com
 * or visit www.terwer.space if you need additional information or have any
 * questions.
 */

// @ts-ignore
import dotenv from "dotenv"
import { join } from "path"
// @ts-ignore
import minimist from "minimist"
import { existsSync } from "fs"

const loadDotenv = () => {
  const args = minimist(process.argv.slice(2))
  const isWatch = args.watch ?? false
  const envFile = (() => {
    const testEnvFile = join(process.cwd(), ".env.test")
    if (existsSync(testEnvFile)) {
      console.log(`loading env variables from ${testEnvFile}`)
      return testEnvFile
    } else {
      console.log(`loading env variables from .env.production`)
      return join(process.cwd(), isWatch ? ".env.development" : ".env.production")
    }
  })()
  dotenv.config({ path: envFile })
}

/**
 * 获取环境变量，仅构建工具和单元测试使用
 *
 * @author terwer
 * @version 0.1.0
 * @since 0.1.0
 */
const getNormalizedEnvDefines = (prefixes: string[] = []) => {
  loadDotenv()
  const envs = {} as any
  for (let k in process.env) {
    k = k.replace(/ /g, "") // hack for now.
    if (k === "CommonProgramFiles(x86)" || k === "ProgramFiles(x86)") {
      continue
    }
    if (k.includes("NODE_PATH")) {
      continue
    }
    if (prefixes.length > 0 && !prefixes.some((prefix) => k.startsWith(prefix))) {
      continue
    }
    envs[`${k}`] = `${process.env[k]}`
  }
  return envs
}

export { getNormalizedEnvDefines }
