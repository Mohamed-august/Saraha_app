
export const userPrefixKey=(userId) =>`users:${userId}:otp`

export const confirmEmailKey =(userId) => `${userPrefixKey(userId)}:confirmEmail`

export const resendOtpKey =(userId) => `${userPrefixKey(userId)}:resend`

export const attemptsKey =(userId) => `${userPrefixKey(userId)}:attempts`

export const attemptsBlockKey =(userId) => `${userPrefixKey(userId)}:block`

export const attemptsBlockCountKey =(userId) => `${userPrefixKey(userId)}:blockCount`

