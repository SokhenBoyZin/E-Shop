import { computed } from 'vue'
import type {
  UserProfileResponse,
  UserProfileForm
} from '~/types/userProfile'

export const useUserProfile = () => {

  const config = useRuntimeConfig()

  /* =========================================
     STATE
  ========================================= */

  const profile = useState<UserProfileResponse | null>(
    'user_profile',
    () => null
  )

  const pending = useState<boolean>(
    'user_profile_pending',
    () => false
  )

  const error = useState<string | null>(
    'user_profile_error',
    () => null
  )


  /* =========================================
     PROFILE IMAGE URL
  ========================================= */

  const profileImageUrl = computed(() => {

    if (!profile.value?.profileImage) {
      return null
    }

    const image = profile.value.profileImage

    // Already a full URL
    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image
    }

    // Remove /api from apiBase if it exists
    const backendUrl =
      config.public.apiBase
        .replace(/\/api\/?$/, '')

    return `${backendUrl}${image.startsWith('/') ? image : `/${image}`}`
  })


  /* =========================================
     AUTH HEADERS
  ========================================= */

  const getHeaders = (): Record<string, string> => {

    if (!import.meta.client) {
      return {}
    }

    const token =
      localStorage.getItem('auth_token')

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  }


  /* =========================================
     GET MY PROFILE
     GET /api/user-profile
  ========================================= */

  const fetchProfile = async () => {

    pending.value = true
    error.value = null

    try {

      const response =
        await $fetch<UserProfileResponse>(
          `${config.public.apiBase}/user-profile`,
          {
            method: 'GET',
            headers: getHeaders()
          }
        )

      profile.value = response

      return {
        success: true,
        data: response
      }

    } catch (err: any) {

      console.error(
        'Failed to fetch user profile:',
        err
      )

      const statusCode =
        err?.statusCode ||
        err?.response?.status

      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to fetch user profile.'

      error.value = message

      profile.value = null

      return {
        success: false,
        error: message,
        statusCode
      }

    } finally {

      pending.value = false

    }

  }


  /* =========================================
     CREATE PROFILE
     POST /api/user-profile
  ========================================= */

  const createProfile = async (
    form: UserProfileForm
  ) => {

    pending.value = true
    error.value = null

    try {

      const formData = new FormData()

      formData.append(
        'FirstName',
        form.firstName
      )

      formData.append(
        'LastName',
        form.lastName
      )

      formData.append(
        'PhoneNumber',
        form.phoneNumber || ''
      )

      if (form.image) {

        formData.append(
          'Image',
          form.image
        )

      }

      const response =
        await $fetch<UserProfileResponse>(
          `${config.public.apiBase}/user-profile`,
          {
            method: 'POST',
            headers: getHeaders(),
            body: formData
          }
        )

      profile.value = response

      return {
        success: true,
        data: response
      }

    } catch (err: any) {

      console.error(
        'Failed to create user profile:',
        err
      )

      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to create user profile.'

      error.value = message

      return {
        success: false,
        error: message
      }

    } finally {

      pending.value = false

    }

  }


  /* =========================================
     UPDATE PROFILE
     PUT /api/user-profile
  ========================================= */

  const updateProfile = async (
    form: UserProfileForm
  ) => {

    pending.value = true
    error.value = null

    try {

      const formData = new FormData()

      formData.append(
        'FirstName',
        form.firstName
      )

      formData.append(
        'LastName',
        form.lastName
      )

      formData.append(
        'PhoneNumber',
        form.phoneNumber || ''
      )

      if (form.image) {

        formData.append(
          'Image',
          form.image
        )

      }

      const response =
        await $fetch<UserProfileResponse>(
          `${config.public.apiBase}/user-profile`,
          {
            method: 'PUT',
            headers: getHeaders(),
            body: formData
          }
        )

      profile.value = response

      return {
        success: true,
        data: response
      }

    } catch (err: any) {

      console.error(
        'Failed to update user profile:',
        err
      )

      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to update user profile.'

      error.value = message

      return {
        success: false,
        error: message
      }

    } finally {

      pending.value = false

    }

  }


  /* =========================================
     CLEAR PROFILE
  ========================================= */

  const clearProfile = () => {

    profile.value = null
    error.value = null

  }


  /* =========================================
     RETURN
  ========================================= */

  return {

    profile,

    profileImageUrl,

    pending,

    error,

    fetchProfile,

    createProfile,

    updateProfile,

    clearProfile

  }

}