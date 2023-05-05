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

import { BasePathTypeEnum, DeviceTypeEnum, SiyuanDevice } from "@siyuan-community/zhi-device"
import ZhiCoreUtil from "./util/ZhiCoreUtil"
import DependencyItem from "./models/DependencyItem"
import Bootstrap from "./core/Bootstrap"

class Zhi {
  private readonly logger
  private readonly common
  private readonly kernelApi

  private readonly runAs

  /**
   * 主题样式最低支持版本
   * @private
   */
  private readonly SUPPORTED_THEME_VERSION = "2.7.6"

  /**
   * 内核最低支持版本
   * @private
   */
  private readonly SUPPORTED_KERNEL_VERSION = "2.8.1"

  /**
   * 主题初始化
   *
   * @param runAs - 运行模式
   */
  constructor(runAs: DeviceTypeEnum) {
    this.logger = ZhiCoreUtil.zhiLog("zhi-core")
    this.common = ZhiCoreUtil.zhiCommon()
    this.kernelApi = ZhiCoreUtil.kernelApi()

    this.runAs = runAs ?? DeviceTypeEnum.DeviceType_Node
  }

  private async main(args: string[]): Promise<DependencyItem[]> {
    this.logger.debug("Parsing args...", args)
    return await Bootstrap.start()
  }

  /**
   * 主流程加载
   */
  public async init(): Promise<void> {
    try {
      this.logger.info(`Zhi Theme runAs ${this.runAs}`)

      // 平台检测
      if (
        this.runAs !== DeviceTypeEnum.DeviceType_Siyuan_MainWin &&
        this.runAs !== DeviceTypeEnum.DeviceType_Siyuan_Browser
      ) {
        this.logger.warn(
          `Zhi Theme can only run as ${DeviceTypeEnum.DeviceType_Siyuan_MainWin} or ${DeviceTypeEnum.DeviceType_Siyuan_Browser}`
        )
        return
      }

      // 检测内核版本
      const kernelVersion = SiyuanDevice.siyuanWindow().siyuan.config.system.kernelVersion
      if (this.common.versionUtil.lesser(kernelVersion, this.SUPPORTED_THEME_VERSION)) {
        const errMsg = this.common.strUtil.f(
          "Your siyuan-note kernel version {0} is not supported by zhi theme, style will look weird, you must install siyuan-note {1}+ to use zhi-theme",
          kernelVersion,
          this.SUPPORTED_THEME_VERSION
        )
        this.logger.error(errMsg)
        this.kernelApi.pushErrMsg({
          msg: errMsg,
        })
        return
      }

      if (this.common.versionUtil.lesser(kernelVersion, this.SUPPORTED_KERNEL_VERSION)) {
        const warnMsg = this.common.strUtil.f(
          "Your siyuan-note kernel version {0} is too low, plugin system will not work, you must install siyuan-note {1}+ to use plugin feature",
          kernelVersion,
          this.SUPPORTED_KERNEL_VERSION
        )
        this.logger.warn(warnMsg)
        this.kernelApi.pushMsg({
          msg: warnMsg,
        })
        return
      }

      // 挂载一个日志对象，方便后续动态使用
      if (typeof window !== "undefined") {
        ;(window as any).zhiLog = ZhiCoreUtil.zhiLog("zhi-core")
        this.logger.info("ZhiLog mounted")
      }
      // 挂载一个require对象
      if (typeof window !== "undefined") {
        ;(window as any).zhiRequire = function (libpath: string) {
          return SiyuanDevice.requireLib(libpath, false, BasePathTypeEnum.BasePathType_ZhiTheme)
        }
        this.logger.info("zhiRequire mounted")
      }
      // 挂载一个import对象
      if (typeof window !== "undefined") {
        ;(window as any).zhiImportPath = async function (libpath: string) {
          return SiyuanDevice.getImportJsPath(libpath, BasePathTypeEnum.BasePathType_ZhiTheme)
        }
        this.logger.info("zhiImportPath mounted")
      }

      // 初始化第三方依赖
      // import
      //   browser     esm path: "/[libpath]"
      //   electron    esm path: "/[libpath]"
      //   custom-path X
      //
      // require
      //   browser     X
      //   electron    cjs path: "[abspath][libpath]"
      //   custom-path require-hacker
      const dynamicImports = await this.main([])
      for (const item of dynamicImports) {
        // 类型校验
        if (item.format !== "esm" && item.format !== "cjs" && item.format !== "js") {
          this.logger.warn("Only esm, cjs supported, skip this lib!", item.libpath)
          continue
        }

        // 运行环境校验
        if (!item.runAs.includes(this.runAs)) {
          this.logger.debug(
            `I'm sorry because current runtime is ${this.runAs}, while lib's define runtime is ${item.runAs}`
          )
          this.logger.warn(`This lib can only run at ${item.runAs}, will skip!Lib is=>${item.libpath}`)
          continue
        }

        this.logger.info(`Loading modules form zhi => ${item.libpath}`)
        let lib
        if (item.importType == "import") {
          const libPath = SiyuanDevice.getImportJsPath(item.libpath, item.baseType)
          lib = await import(libPath)
          this.logger.debug(`Importing lib ${item.libpath} with basePath of ${item.baseType} ...`)
        } else {
          lib = SiyuanDevice.requireLib(item.libpath, false, item.baseType)
          this.logger.debug(`Requiring lib ${item.libpath} with basePath of ${item.baseType} ...`)
        }
        // 如果有初始化方法，进行初始化
        if (lib) {
          const libObj = lib
          this.logger.debug(`Current ${item.importType} lib ${item.libpath} Obj=>`, typeof libObj)
          if (typeof libObj == "function") {
            await libObj()
            this.logger.info(`Inited ${item.libpath} with default function`)
          } else {
            if (libObj.init) {
              const res = await libObj.init()
              if (res) {
                this.logger.info(`Detected output from ${item.importType} lib ${item.libpath}=>`, res)
              }
              this.logger.info(`Inited ${item.libpath} with init function`)
            } else {
              if (libObj.default) {
                const res = await libObj.default()
                if (res) {
                  this.logger.info(`Detected output from ${item.importType} lib ${item.libpath}=>`, res)
                }
                this.logger.info(`Inited ${item.libpath} with default function`)
              }
              this.logger.info(`No init method for ${item.importType} ${item.libpath}`)
            }
          }
        } else {
          this.logger.debug(`Lib entry is not a function => ${item.importType} ${item.libpath}`, lib)
        }
        this.logger.info(`Success ${item.importType} ${item.libpath}`)
      }

      this.logger.info("Zhi Theme inited")
    } catch (e) {
      this.logger.error("Zhi Theme load error=>", e)
    }
  }
}

export default Zhi
