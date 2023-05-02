import { app, shell } from 'electron'
import { constants, pathExists, accessSync, existsSync, renameSync, ensureDir } from 'fs-extra'
import { join } from 'node:path'
import { exec } from 'node:child_process'
import sudo from 'sudo-prompt'

export const applicationsDirectory = '/Applications'

export const getDestinationPath = (name: string) => {
  const appName = `${name}.app`
  const result = join(applicationsDirectory, appName)
  return result
}

export const unzip = async (zipPath: string, outputPath: string) => {
  const command = `unzip -o ${zipPath} -d ${outputPath}`
  return new Promise((resolve, reject) => {
    exec(command).on('exit', (code) => {
      if (code !== 0) {
        console.error(`Error unzipping updater file: ${code}`);
        reject(code)
      } else {
        console.log(`Updater file unzipped successfully to ${outputPath}`);
        resolve(true)
      }
    });
  })
}

export const moveToTrash = async (path: string) => {
  const exist = await pathExists(path)
  if (!exist) {
    return true
  }
  
  return shell.trashItem(path)
}

export const moveToApplications = async (name: string, sourcePath: string) => {
  const exist = await pathExists(sourcePath)
  if (!exist) {
    throw new Error('install:source:notExist')
  }
  
  const destinationPath = getDestinationPath(name)
  let needAuthorization = false

  try {
    accessSync(applicationsDirectory, constants.W_OK)
    if (existsSync(destinationPath)) {
      accessSync(destinationPath, constants.W_OK)
    }
  } catch (err) {
    needAuthorization = true
  }

  try {
    if (existsSync(destinationPath)) {
      await moveToTrash(destinationPath)
    }
  } catch (err) {
    console.log('moveToTrash failed', err)
    shell.openPath(destinationPath)
    throw new Error('install:trash:failed')
  }

  if (needAuthorization) {
    const command = `mv -f "${sourcePath}" "${destinationPath}"`
    sudo.exec(command, { name }, (error) => {
      if (error) {
        shell.openPath(sourcePath)
        throw new Error('install:move:falied')
      }
    })
  } else {
    renameSync(sourcePath, destinationPath)
  }
}

export const installApplicationUseZip = async (name: string, zipPath: string) => {
  const exist = await pathExists(zipPath)
  if (!exist) {
    throw new Error('install:source:notExist')
  }

  const appName = `${name}.app`
  const tempPath = app.getPath('temp')
  const tempDir = join(tempPath, `${name}-${Date.now()}`)
  await ensureDir(tempDir)
  const targetPath = join(tempDir, appName)
  const targetExist = await pathExists(targetPath)
  if (targetExist) {
    await moveToApplications(name, targetPath)
    return
  }

  await unzip(zipPath, tempDir)
  await moveToApplications(name, targetPath)
}
