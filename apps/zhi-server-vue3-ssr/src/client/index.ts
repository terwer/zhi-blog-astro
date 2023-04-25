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

import createVueApp from "../app"
import ZhiServerVue3SsrUtil from "~/utils/ZhiServerVue3SsrUtil"
import { cachePlugin } from "~/plugins/cache-plugin/cacheProvider"

const logger = ZhiServerVue3SsrUtil.zhiLog("ssr-client")
const { app, router } = createVueApp()

// pina cache
// 1 服务端数据在 src/server/index.ts 注入 window.cache
// 2 接下来在这里可以通过 window.cache 获取，然后在通过 plugins/cache-plugin/cacheProvider 的 provider 注入全局依赖
// 3 最后，在 composables/useCache.ts 通过 inject 获取
// 4 在使用的时候，用 const cache = useCache() 即可
app.use(cachePlugin)

// 如果传递 next 可以拦截路由做跳转
router.beforeEach(async function (to, from) {
  // 页面刷新时执行该回调函数
  logger.debug(`beforeEach invoked, from:${from}, to:${to}`)
})
router.isReady().then(function () {
  app.mount("#app")
})
