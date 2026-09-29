export interface UserProfileResponse {
  userProfileId: number
  userId: number
  firstName: string
  lastName: string
  phoneNumber: string | null
  profileImage: string | null
}

export interface UserProfileForm {
  firstName: string
  lastName: string
  phoneNumber: string
  image?: File | null
}