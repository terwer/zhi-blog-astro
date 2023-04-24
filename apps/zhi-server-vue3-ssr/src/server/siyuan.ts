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

import ZhiServerVue3SsrUtil from "~/utils/ZhiServerVue3SsrUtil"
import { SiyuanDevice } from "zhi-device"
import express from "express"
import ServerMiddleware from "~/src/server/index"

/**
 * HTTP 服务入口
 *
 * @param basePath - 基本路径，默认是 zhi 主题路径，需要传递绝对路径
 * @param port - 端口
 */
function init(basePath?: string, port?: number) {
  const logger = ZhiServerVue3SsrUtil.zhiLog("siyuan-server")

  const serverMiddleware = new ServerMiddleware()
  const server = serverMiddleware.createExpressServer()

  // 指定静态文件目录
  const base = SiyuanDevice.joinPath(SiyuanDevice.zhiThemePath(), "/dynamic/blog")
  const staticPath = process.env.DIST_PATH ?? base
  logger.info("staticPath=>", staticPath)
  server.use(express.static(staticPath))

  // 启动 express
  serverMiddleware.startServer(server, port)

  return "ok"
}

export default init
