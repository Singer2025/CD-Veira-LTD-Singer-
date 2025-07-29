'use server'
import { ISettingInput, ICarousel } from '@/types'
import data from '../data'
import Setting from '../db/models/setting.model'
import { connectToDatabase } from '../db'
import { formatError } from '../utils'
import { cookies } from 'next/headers'

const globalForSettings = global as unknown as {
  cachedSettings: ISettingInput | null
}
export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  await connectToDatabase()
  const setting = await Setting.findOne()
  return JSON.parse(JSON.stringify(setting)) as ISettingInput
}

export const getSetting = async (): Promise<ISettingInput> => {
  await connectToDatabase()
  const setting = await Setting.findOne().lean()
  const result = setting
    ? JSON.parse(JSON.stringify(setting))
    : data.settings[0]
  
  // Ensure carousels array exists with proper structure
  if (!result.carousels) {
    result.carousels = []
  } else {
    result.carousels = result.carousels.map((carousel: Partial<ICarousel>) => ({
      ...carousel,
      isPublished: carousel.isPublished !== undefined ? carousel.isPublished : true,
      textColor: carousel.textColor || '#FFFFFF' // Changed default to white for better visibility on carousel images
    }))
  }

  globalForSettings.cachedSettings = result
  return result as ISettingInput
}

export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    await connectToDatabase()
    
    // Ensure carousels array has proper structure
    if (newSetting.carousels) {
      newSetting.carousels = newSetting.carousels.map((carousel: Partial<ICarousel>) => ({
        url: carousel.url || '',
        title: carousel.title || '',
        image: carousel.image || '',
        buttonCaption: carousel.buttonCaption || '',
        isPublished: carousel.isPublished !== undefined ? carousel.isPublished : true,
        textColor: carousel.textColor || '#FFFFFF' // Changed default to white for better visibility on carousel images
      }))
    }

    const updatedSetting = await Setting.findOneAndUpdate({}, newSetting, {
      upsert: true,
      new: true,
    }).lean()
    globalForSettings.cachedSettings = JSON.parse(
      JSON.stringify(updatedSetting)
    ) // Update the cache
    return {
      success: true,
      message: 'Setting updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Server action to update the currency cookie
export const setCurrencyOnServer = async (newCurrency: string) => {
  'use server'
  const cookiesStore = await cookies()
  cookiesStore.set('currency', newCurrency)

  return {
    success: true,
    message: 'Currency updated successfully',
  }
}
