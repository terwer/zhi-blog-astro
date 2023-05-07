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

import express, { Express, Response } from "express"
import ZhiServerBlogVueUtil from "~/utils/ZhiServerBlogVueUtil"
import createVueApp from "~/src/app"
import { renderToString } from "vue/server-renderer"
import path from "path"
import "cross-fetch/polyfill"

/**
 * 通用的 express 实例
 *
 * @author terwer
 * @version 1.0.0
 * @since 1.0.0
 */
class ServerMiddleware {
  protected env
  protected logger

  constructor() {
    this.env = ZhiServerBlogVueUtil.zhiEnv()
    this.logger = ZhiServerBlogVueUtil.zhiLog("server-middleware")
  }

  /**
   * 创建一个 express 实例，并添加通用路由
   *
   * @protected
   * @param staticPath - 静态资源路径，不传递则不设置
   */
  public createExpressServer(staticPath?: string) {
    const logger = ZhiServerBlogVueUtil.zhiLog("server-middleware")
    const server = express()

    /**
     * CORS 在 vercel.json 配置，这里只处理 OPTIONS 预检请求
     */
    server.use(function (req, res, next) {
      if (req.method === "OPTIONS") {
        logger.debug("precheck request received")
        res.send(200)
      } else {
        next()
      }
    })

    // 这里可以添加一些仅服务端运行的不兼容浏览器的全局依赖
    require("../../public/lib/lute/lute-1.7.5-20230410.min.cjs")
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger.info("required Lute in Server Side Rendering success", Lute.Version)

    // 静态资源路径
    if (staticPath) {
      // 指定静态文件目录
      const absStaticPath = path.resolve(staticPath)
      server.use(express.static(absStaticPath, { maxAge: "1m" }))
      logger.info("staticPath is set using express=>", absStaticPath)
    } else {
      // 这种情况比较特殊，一般是 serverless 自带 CDN 的时候，例如 vercel
      // vercel 推荐使用 cdn 指定 dist， 而不是用 express.static
      // https://vercel.com/guides/using-express-with-vercel#adding-a-public-directory
      logger.info(
        "staticPath is undefined, may be you are in serverless env like Vercel etc.see https://vercel.com/guides/using-express-with-vercel#adding-a-public-directory for more details"
      )
    }

    // api 接口
    server.get("/api", (req, res) => {
      this.setApiCache(res)
      res.send("Hello World!")
    })

    server.get("/api/user/:id", (req, res) => {
      this.setApiCache(res)
      const userId = req.params.id // 获取URL参数id
      const user = {
        id: userId,
        name: "Emily",
        age: 28,
        email: "emily@gmail.com",
      }
      res.json(user)
    })

    // 服务器端路由匹配
    server.get("*", (req, res) => {
      this.setPageCache(res)

      const context = {
        url: req.url,
      }

      const { app, router, pinia } = createVueApp()

      logger.debug("ssr context=>", context)
      router
        .push(context.url)
        .then(() => {
          logger.info("route pushed to=>", context.url)

          router.isReady().then(() => {
            // 匹配组件
            logger.debug("router.isReady")
            const matchedComponents = router.currentRoute.value.matched
            logger.trace("matchedComponents=>", matchedComponents)
            if (!matchedComponents.length) {
              return res.status(404).end("Page Not Found")
            }

            Promise.all(
              matchedComponents.map((component: any) => {
                logger.debug("do some work for component", component)
              })
            )
              .then(() => {
                logger.trace("start renderToString...")
                const staticV = "202304220051"
                renderToString(app, context).then((appHtml) => {
                  logger.trace("appHtml=>", appHtml)
                  res.send(`
                  <!DOCTYPE html>
                  <html lang="zh">
                    <head>
                      <meta charset="UTF-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                      <link rel="icon" href="/favicon.ico">
                      <link rel="stylesheet" href="/app.css?v=${staticV}" />
                      <title>zhi-blog-ssr-dev</title>
                    </head>
                    <body>
                      <div id="app">${appHtml}</div>
                      <script type="module" src="/app.js?v=${staticV}" async defer></script>
                      <script src="/lib/lute/lute-1.7.5-20230410.min.cjs?v=${staticV}" async defer></script>
                      <script>window.cache = ${JSON.stringify(pinia.state.value)}</script>
                    </body>
                  </html>
              `)
                  res.end()
                })
              })
              .catch((reason) => {
                res.end("error, reason is:" + reason)
              })
          })
        })
        .catch((reason) => {
          logger.error("route push failed", reason)
        })
    })

    return server
  }

  private setApiCache(res: Response) {
    res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate")
  }

  private setPageCache(res: Response) {
    res.setHeader("Content-Type", "text/html")
    res.setHeader("Cache-Control", "s-max-age=10, stale-while-revalidate")
  }

  /**
   * 启动 express 服务器
   *
   * @param server express 实例
   * @param p 端口，默认3333
   */
  public startServer(server: Express, p?: number) {
    const logger = ZhiServerBlogVueUtil.zhiLog("server-middleware")

    // 监听端口
    const listener = server.listen(p ?? 3333, () => {
      let serveUrl
      const addr = listener.address() ?? "unknown host"
      if (typeof addr == "string") {
        serveUrl = addr
      } else {
        const { port, address } = addr
        serveUrl = `${address}:${port}`
      }
      logger.info(`Server is listening on ${serveUrl}`)
      logger.info("Note that if you running in docker, this port is an inner port")
    })
  }
}

export default ServerMiddleware
