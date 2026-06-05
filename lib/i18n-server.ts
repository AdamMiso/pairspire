import { cookies } from 'next/headers'
import { isLanguage, languageCookie, type Language } from '@/lib/i18n'

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies()
  const value = cookieStore.get(languageCookie)?.value
  return isLanguage(value) ? value : 'sk'
}
