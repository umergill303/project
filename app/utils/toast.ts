export function showToast(type: keyof typeof messages, customDescription?: string) {
  const toast = useToast()

  // icons
  const copy = 'i-lucide-copy'
  const error = 'tabler:info-triangle-filled'
  const deleted = 'tabler:trash'
  const invite = 'i-mingcute-user-add-2-fill'
  const success = 'iconoir:check-circle-solid'

  // colors
  const primary = 'primary' as const
  const errorColor = 'error' as const

  const messages = {
    // error
    error: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: 'Whoops! We hit a snag. Try again in a moment!'
    },

    // about
    aboutUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'About information update success',
    },

    // Seo page
    seoUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Page SEO information updated successfully',
    },

    // brand
    brandAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The brand has been successfully added.',
    },
    brandUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The brand have been successfully updated.',
    },
    brandDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The brand has been successfully removed.',
    },

    // category
    categoryAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The category has been successfully added.',
    },
    categoryUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The category have been successfully updated.',
    },
    categoryDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The category has been successfully removed.',
    },

    // tag
    tagAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The tag has been successfully added.',
    },
    tagUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The tag have been successfully updated.',
    },
    tagDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The tag has been successfully removed.',
    },

    // products
    productAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The product has been successfully added.',
    },
    productUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The product have been successfully updated.',
    },
    productDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The product has been successfully removed.',
    },
    productsDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The products have been successfully removed.',
    },
    productPublished: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The product has been successfully published.',
    },

    productVideo: {
      icon: error,
      color: error,
      title: 'Error',
      description: 'Video file is too large. Maximum size is 32MB.',
    },
    sizeVariantDeleted: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Size variant deleted successfully.'
    },

    // orders
    orderAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The order has been successfully placed.',
    },
    orderUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The order status has been successfully updated.',
    },
    orderDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The order has been successfully deleted.',
    },
    ordersDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The orders have been successfully removed.',
    },

    // customer
    customerAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The customer has been successfully added.',
    },
    customerUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The customer details have been successfully updated.',
    },
    customerDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The customer has been successfully removed.',
    },
    customersDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The customers have been successfully removed.',
    },
    customerIdCopy: {
      icon: copy,
      color: primary,
      title: 'Success',
      description: 'The customer ID has been copied to the clipboard.',
    },

    // member
    memberInvited: {
      icon: invite,
      color: primary,
      title: 'Success',
      description: 'The member has been successfully invited.',
    },

    // offer
    offerAdded: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'A new offer has been successfully added.',
    },
    offerUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Offer has been successfully updated.',
    },
    offerDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'Offer has been successfully removed.',
    },
    offerProductRemoved: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'Product has been successfully removed from offer.',
    },
    offerActivation: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The offer activation has been successfully updated.',
    },
    offerDectivation: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The offer Deactivated successfully .',
    },

    // Coupon
    couponSaved: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The coupon has been successfully saved.',
    },
    couponDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'The coupon has been successfully removed.',
    },
    couponActivation: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The coupon activation has been successfully updated.',
    },
    couponDeactivated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The coupon Deactivated has been successfully.',
    },

    // slide
    slideSaved: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'The slide has been successfully saved.',
    },
    slideDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'Slide has been successfully deleted.',
    },

    // avatarToast
    avatarUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Avatar uploaded successfully!',
    },
    avatarError: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: customDescription || 'Failed to upload avatar. Please try again later.',
    },
    avatarSelect: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: 'Please select an image first.',
    },
    avatarFileSelect: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: 'Please select an image file.',
    },
    avatarSize: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: 'Image must be less than 2MB.',
    },

    //  profile Toast
    profileUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Your profile has been successfully updated.',
    },
    profileError: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: 'Failed to update profile. Please try again later.',
    },

    // change password Toast
    passwordUpdated: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Your password has been successfully updated!',
    },
    passwordError: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: customDescription || 'Failed to change your password. Please try again.',
    },
    passwordSError: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: customDescription || 'An error occurred while changing your password.',
    },

    // Auth
    userLogout: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'You have been successfully logged out.',
    },
    selectedProduct: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: 'At least one product must be selected.',
    },
    registered: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'You have been successfully registered.',
    },
    registeredError: {
      icon: error,
      color: errorColor,
      title: 'Error',
      description: customDescription || 'Registration failed. Please try again.',
    },
    loginSuccess: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Successfully logged in.',
    },
    emailNotFound: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: 'Email not found. Please check your email or register.',
    },
    incorrectPassword: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: 'Incorrect password. Please try again.',
    },
    loginError: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: customDescription || 'Login failed. Please try again.',
    },
    accountDeleted: {
      icon: deleted,
      color: primary,
      title: 'Success',
      description: 'Your account has been successfully deleted.',
    },

    // cart
    productAddedToCart: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Product added to cart successfully.'
    },
    cartLimitReached: {
      icon: error,
      title: 'Limit Reached',
      color: errorColor,
      description: 'You cannot add more than 10 products to your cart.'
    },
    cartUnknow: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: customDescription || 'An unknown error occurred Try again.'
    },
    cartError: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: 'Failed to add the product to your cart.'
    },
    cartQuantity: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'All quantities updated successfully.'
    },
    CartError: {
      icon: error,
      title: 'Error',
      color: error,
      description: 'Failed to update quantities.'
    },
    cartDelete: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Product removed successfully.'
    },
    cartDelError: {
      icon: error,
      color: error,
      title: 'Error',
      description: 'Failed to removed Product '
    },

    // wish
    productAddedToWishlist: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Product added to favorites successfully.'
    },
    wishlistError: {
      icon: error,
      title: 'Error',
      color: errorColor,
      description: customDescription || 'Failed to add product to favorites.'
    },
    deleteWishlist: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Product removed from your favorites.'
    },

    messageSend: {
      icon: success,
      color: primary,
      title: 'Success',
      description: 'Your message has been sent successfully.',
    }

  }

  if (messages[type as keyof typeof messages]) {
    toast.add({ ...messages[type as keyof typeof messages] })
  }
}
