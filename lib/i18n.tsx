import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

export type AppLanguage = 'es' | 'en' | 'de' | 'fr' | 'it';

type TranslationKey =
  | 'tabs.calls'
  | 'tabs.chats'
  | 'tabs.groups'
  | 'tabs.settings'
  | 'tabs.linked_devices'
  | 'tabs.notifications'
  | 'common.search'
  | 'common.continue'
  | 'common.refresh'
  | 'common.sign_out'
  | 'common.log_out'
  | 'common.photo'
  | 'common.video'
  | 'welcome.headline'
  | 'welcome.read_our'
  | 'welcome.privacy_policy'
  | 'welcome.tap_agree_continue'
  | 'welcome.terms_of_service'
  | 'welcome.agree_continue'
  | 'auth.sign_in'
  | 'auth.subtitle'
  | 'auth.continue_google'
  | 'auth.continue_apple'
  | 'auth.continue_phone'
  | 'auth.legal'
  | 'settings.title'
  | 'settings.language'
  | 'settings.account'
  | 'settings.privacy'
  | 'settings.chats'
  | 'settings.notifications'
  | 'settings.storage_data'
  | 'settings.broadcast_lists'
  | 'settings.starred_messages'
  | 'settings.linked_devices'
  | 'settings.app_updates'
  | 'settings.help'
  | 'settings.tell_friend'
  | 'settings.log_out'
  | 'language.title'
  | 'language.select_title'
  | 'language.select_subtitle'
  | 'chats.no_conversations'
  | 'chats.group'
  | 'chats.chat'
  | 'account.title'
  | 'account.not_signed_in'
  | 'account.go_to_sign_in'
  | 'linked_devices.title'
  | 'linked_devices.devices'
  | 'linked_devices.session_count_singular'
  | 'linked_devices.session_count_plural'
  | 'linked_devices.tap_refresh'
  | 'linked_devices.no_sessions_loaded'
  | 'linked_devices.no_active_sessions'
  | 'linked_devices.this_device'
  | 'linked_devices.session'
  | 'linked_devices.status'
  | 'linked_devices.last_active'
  | 'linked_devices.expires'
  | 'linked_devices.footer'
  | 'link_device.title'
  | 'link_device.cta'
  | 'link_device.scan_title'
  | 'link_device.scan_description'
  | 'link_device.approving'
  | 'link_device.camera_title'
  | 'link_device.camera_description'
  | 'link_device.grant_permission'
  | 'link_device.confirm_title'
  | 'link_device.confirm_message'
  | 'link_device.cancel'
  | 'link_device.confirm_action'
  | 'link_device.success_title'
  | 'link_device.success_message'
  | 'link_device.error_title'
  | 'link_device.error_message'
  | 'link_device.biometric_unavailable_title'
  | 'link_device.biometric_unavailable_message'
  | 'link_device.biometric_prompt'
  | 'link_device.biometric_fallback'
  | 'link_device.biometric_failed_title'
  | 'link_device.biometric_failed_message'
  | 'app_updates.title'
  | 'app_updates.current_version'
  | 'app_updates.auto_update'
  | 'app_updates.auto_update_subtitle'
  | 'app_updates.auto_update_ios_subtitle'
  | 'app_updates.notify'
  | 'app_updates.notify_subtitle'
  | 'app_updates.notify_disabled_subtitle'
  | 'app_updates.permission_title'
  | 'app_updates.permission_message'
  | 'otp.title'
  | 'otp.description'
  | 'otp.phone_placeholder'
  | 'otp.sending_code'
  | 'otp.next'
  | 'otp.select_country'
  | 'verify.sms_sent'
  | 'verify.enter_code'
  | 'verify.resend'
  | 'new_chat.title'
  | 'new_chat.search_placeholder'
  | 'notifications.title'
  | 'notifications.messages'
  | 'notifications.messages_subtitle'
  | 'notifications.groups'
  | 'notifications.groups_subtitle'
  | 'notifications.sound'
  | 'notifications.sound_subtitle'
  | 'notifications.vibration'
  | 'notifications.vibration_subtitle'
  | 'notifications.previews'
  | 'notifications.previews_subtitle'
  | 'common.cancel'
  | 'phone_numbers.title'
  | 'phone_numbers.your_numbers'
  | 'phone_numbers.add_existing'
  | 'phone_numbers.number_placeholder'
  | 'phone_numbers.label_placeholder'
  | 'phone_numbers.add'
  | 'phone_numbers.add_error'
  | 'phone_numbers.active'
  | 'phone_numbers.pending'
  | 'phone_numbers.default'
  | 'phone_numbers.delete'
  | 'phone_numbers.delete_title'
  | 'phone_numbers.delete_message'
  | 'phone_numbers.request_new'
  | 'phone_numbers.didww_info'
  | 'phone_numbers.didww_description'
  | 'phone_numbers.didww_steps_title'
  | 'phone_numbers.didww_step_1'
  | 'phone_numbers.didww_step_2'
  | 'phone_numbers.didww_step_3'
  | 'phone_numbers.didww_step_4'
  | 'phone_numbers.understood'
  | 'phone_numbers.no_numbers'
  | 'phone_numbers.set_default'
  | 'phone_numbers.already_linked'
  | 'phone_numbers.check_error'
  | 'phone_numbers.embedded_signup'
  | 'phone_numbers.missing_config'
  | 'phone_numbers.verify_whatsapp'
  | 'phone_numbers.checking'
  | 'phone_numbers.verify_description'
  | 'phone_numbers.number_to_verify'
  | 'phone_numbers.open_signup'
  | 'phone_numbers.already_verified'
  | 'phone_numbers.cancel'
  | 'phone_numbers.enter_credentials'
  | 'phone_numbers.credentials_description'
  | 'phone_numbers.token_placeholder'
  | 'phone_numbers.phone_id_placeholder'
  | 'phone_numbers.adding'
  | 'menu.new_group'
  | 'menu.linked_devices'
  | 'menu.mark_all_read'
  | 'menu.settings'
  | 'header.messages'
  | 'new_chat.contacts_on_messages'
  | 'new_chat.search_name_or_number'
  | 'new_chat.no_users'
  | 'new_chat.add_by_number'
  | 'new_chat.country'
  | 'new_chat.phone_number'
  | 'new_chat.verify_number'
  | 'new_chat.number_not_registered'
  | 'new_chat.start_chat'
  | 'new_chat.whatsapp_numbers'
  | 'new_chat.new_contact'
  | 'settings.appearance'
  | 'appearance.title'
  | 'appearance.dark'
  | 'appearance.light'
  | 'appearance.description';

const STORAGE_KEY = 'settings.language';

const normalizeLanguage = (code?: string | null): AppLanguage => {
  switch (code) {
    case 'es':
    case 'en':
    case 'de':
    case 'fr':
    case 'it':
      return code;
    default:
      return 'es';
  }
};

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  es: {
    'tabs.calls': 'Llamadas',
    'tabs.chats': 'Chats',
    'tabs.groups': 'Grupos',
    'tabs.settings': 'Ajustes',
    'tabs.linked_devices': 'Dispositivos vinculados',
    'tabs.notifications': 'Notificaciones',
    'common.search': 'Buscar',
    'common.continue': 'Continuar',
    'common.refresh': 'Actualizar',
    'common.sign_out': 'Cerrar sesión',
    'common.log_out': 'Cerrar sesión',
    'common.photo': 'Foto',
    'common.video': 'Vídeo',
    'welcome.headline': 'Bienvenido a WhatsApp Clone',
    'welcome.read_our': 'Lee nuestra',
    'welcome.privacy_policy': 'Política de privacidad',
    'welcome.tap_agree_continue': 'Pulsa "Aceptar y continuar" para aceptar los',
    'welcome.terms_of_service': 'Términos de servicio',
    'welcome.agree_continue': 'Aceptar y continuar',
    'auth.sign_in': 'Iniciar sesión',
    'auth.subtitle': 'Continúa a WhatsApp Clone',
    'auth.continue_google': 'Continuar con Google',
    'auth.continue_apple': 'Continuar con Apple',
    'auth.continue_phone': 'Continuar con teléfono',
    'auth.legal': 'Al continuar, aceptas nuestros Términos y reconoces nuestra Política de Privacidad.',
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.account': 'Cuenta',
    'settings.privacy': 'Privacidad',
    'settings.chats': 'Chats',
    'settings.notifications': 'Notificaciones',
    'settings.storage_data': 'Almacenamiento y datos',
    'settings.broadcast_lists': 'Listas de difusión',
    'settings.starred_messages': 'Mensajes destacados',
    'settings.linked_devices': 'Dispositivos vinculados',
    'settings.app_updates': 'Actualizaciones de la app',
    'settings.help': 'Ayuda',
    'settings.tell_friend': 'Invitar a un amigo',
    'settings.log_out': 'Cerrar sesión',
    'language.title': 'Idioma',
    'language.select_title': 'Selecciona tu idioma',
    'language.select_subtitle': 'Podrás cambiarlo más tarde.',
    'chats.no_conversations': 'Aún no tienes conversaciones',
    'chats.group': 'Grupo',
    'chats.chat': 'Chat',
    'account.title': 'Cuenta',
    'account.not_signed_in': 'No has iniciado sesión.',
    'account.go_to_sign_in': 'Ir a iniciar sesión',
    'linked_devices.title': 'Dispositivos vinculados',
    'linked_devices.devices': 'Dispositivos',
    'linked_devices.session_count_singular': 'sesión activa',
    'linked_devices.session_count_plural': 'sesiones activas',
    'linked_devices.tap_refresh': 'Toca actualizar para cargar sesiones',
    'linked_devices.no_sessions_loaded': 'No se han cargado sesiones.',
    'linked_devices.no_active_sessions': 'No hay sesiones activas.',
    'linked_devices.this_device': 'Este dispositivo',
    'linked_devices.session': 'Sesión',
    'linked_devices.status': 'Estado',
    'linked_devices.last_active': 'Última actividad',
    'linked_devices.expires': 'Caduca',
    'linked_devices.footer': 'Esto se basa en las sesiones de tu cuenta (misma identidad que usa el backend de Messages).',
    'link_device.title': 'Vincular un dispositivo',
    'link_device.cta': 'Vincular un dispositivo',
    'link_device.scan_title': 'Escanea el código QR',
    'link_device.scan_description': 'Apunta la cámara al código QR que aparece en Messages (web).',
    'link_device.approving': 'Vinculando...',
    'link_device.camera_title': 'Permiso de cámara',
    'link_device.camera_description': 'Necesitamos acceso a la cámara para escanear el código QR.',
    'link_device.grant_permission': 'Permitir cámara',
    'link_device.confirm_title': '¿Vincular dispositivo?',
    'link_device.confirm_message': 'Vas a iniciar sesión en Messages en este navegador. ¿Quieres continuar?',
    'link_device.cancel': 'Cancelar',
    'link_device.confirm_action': 'Vincular',
    'link_device.success_title': 'Dispositivo vinculado',
    'link_device.success_message': 'Ya puedes usar Messages en este navegador.',
    'link_device.error_title': 'No se pudo vincular',
    'link_device.error_message': 'El código es inválido o ha caducado. Vuelve a intentarlo.',
    'link_device.biometric_unavailable_title': 'Biometría no disponible',
    'link_device.biometric_unavailable_message': 'Activa Face ID/Touch ID (o huella) en tu teléfono para poder vincular dispositivos.',
    'link_device.biometric_prompt': 'Confirma tu identidad para vincular el dispositivo',
    'link_device.biometric_fallback': 'Usar código del dispositivo',
    'link_device.biometric_failed_title': 'No verificado',
    'link_device.biometric_failed_message': 'No se pudo verificar tu identidad. Inténtalo de nuevo.',
    'app_updates.title': 'Actualizaciones de la app',
    'app_updates.current_version': 'Versión actual',
    'app_updates.auto_update': 'Actualizar automáticamente',
    'app_updates.auto_update_subtitle': 'Por la noche, buscar e instalar actualizaciones si hay una versión nueva.',
    'app_updates.auto_update_ios_subtitle': 'Por la noche, buscar actualizaciones y avisarte para descargar.',
    'app_updates.notify': 'Notificar actualizaciones',
    'app_updates.notify_subtitle': 'Si hay una nueva versión disponible, recibirás una notificación.',
    'app_updates.notify_disabled_subtitle': 'Desactiva la actualización automática para controlar las notificaciones.',
    'app_updates.permission_title': 'Permiso de notificaciones',
    'app_updates.permission_message': 'Activa las notificaciones para avisarte cuando haya una actualización.',
    'otp.title': 'Introduce tu número de teléfono',
    'otp.description': 'WhatsApp necesitará verificar tu cuenta. Pueden aplicarse cargos del operador.',
    'otp.phone_placeholder': 'Número de teléfono',
    'otp.sending_code': 'Enviando código...',
    'otp.next': 'Siguiente',
    'otp.select_country': 'Seleccionar país',
    'verify.sms_sent': 'Te hemos enviado un SMS con un código al número anterior.',
    'verify.enter_code': 'Para completar la verificación, introduce el código de activación de 6 dígitos.',
    'verify.resend': '¿No recibiste el código de verificación?',
    'new_chat.title': 'Nuevo chat',
    'new_chat.search_placeholder': 'Buscar nombre o número',
    'notifications.title': 'Notificaciones',
    'notifications.messages': 'Mensajes',
    'notifications.messages_subtitle': 'Notificaciones para chats individuales',
    'notifications.groups': 'Grupos',
    'notifications.groups_subtitle': 'Notificaciones para chats de grupo',
    'notifications.sound': 'Sonido',
    'notifications.sound_subtitle': 'Reproducir un sonido en las notificaciones',
    'notifications.vibration': 'Vibración',
    'notifications.vibration_subtitle': 'Vibrar al recibir un mensaje',
    'notifications.previews': 'Previsualizaciones',
    'notifications.previews_subtitle': 'Mostrar el contenido del mensaje en la notificación',
    'common.cancel': 'Cancelar',
    'phone_numbers.title': 'Números de teléfono',
    'phone_numbers.your_numbers': 'Tus números',
    'phone_numbers.add_existing': 'Añadir número existente',
    'phone_numbers.number_placeholder': '+34 600 000 000',
    'phone_numbers.label_placeholder': 'Etiqueta (opcional)',
    'phone_numbers.add': 'Añadir',
    'phone_numbers.add_error': 'Error al añadir número',
    'phone_numbers.active': 'Activo',
    'phone_numbers.pending': 'Pendiente',
    'phone_numbers.default': 'Principal',
    'phone_numbers.delete': 'Eliminar',
    'phone_numbers.delete_title': 'Eliminar número',
    'phone_numbers.delete_message': '¿Seguro que quieres eliminar este número?',
    'phone_numbers.request_new': 'Solicitar número nuevo',
    'phone_numbers.didww_info': 'Si no dispones de un número, podemos ofrecerte tantos como necesites vía DIDWW.',
    'phone_numbers.didww_description': 'Esta funcionalidad requiere una cuenta DIDWW con saldo. Contacta con el administrador.',
    'phone_numbers.didww_steps_title': 'Pasos para activar DIDWW:',
    'phone_numbers.didww_step_1': 'Crea una cuenta en didww.com',
    'phone_numbers.didww_step_2': 'Deposita saldo en tu cuenta',
    'phone_numbers.didww_step_3': 'Configura la API key en las variables de entorno',
    'phone_numbers.didww_step_4': 'Vuelve aquí para solicitar números automáticamente',
    'phone_numbers.understood': 'Entendido',
    'phone_numbers.no_numbers': 'Aún no tienes números de teléfono.',
    'phone_numbers.set_default': 'Establecer como principal',
    'phone_numbers.already_linked': 'Este número ya está vinculado a otra cuenta.',
    'phone_numbers.check_error': 'Error al comprobar el número.',
    'phone_numbers.embedded_signup': 'Verificación WhatsApp Business',
    'phone_numbers.missing_config': 'Falta configurar EXPO_PUBLIC_META_APP_ID o EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID en el archivo .env',
    'phone_numbers.verify_whatsapp': 'Verificar con WhatsApp',
    'phone_numbers.checking': 'Comprobando número...',
    'phone_numbers.verify_description': 'Para añadir este número, debes verificarlo primero a través de WhatsApp Business Embedded Signup.',
    'phone_numbers.number_to_verify': 'Número a verificar',
    'phone_numbers.open_signup': 'Abrir verificación de WhatsApp',
    'phone_numbers.already_verified': 'Ya he verificado',
    'phone_numbers.cancel': 'Cancelar',
    'phone_numbers.enter_credentials': 'Introduce las credenciales de WhatsApp',
    'phone_numbers.credentials_description': 'Introduce el token de acceso y el identificador del número que has recibido tras la verificación.',
    'phone_numbers.token_placeholder': 'Token de acceso (EAAXX...)',
    'phone_numbers.phone_id_placeholder': 'Identificador del número (1XXXXXXXX...)',
    'phone_numbers.adding': 'Añadiendo número...',
    'menu.new_group': 'Nuevo Grupo',
    'menu.linked_devices': 'Dispositivos vinculados',
    'menu.mark_all_read': 'Marcar todos como leídos',
    'menu.settings': 'Ajustes',
    'header.messages': 'Messages',
    'new_chat.contacts_on_messages': 'Contactos en Messages',
    'new_chat.search_name_or_number': 'Buscar nombre o número',
    'new_chat.no_users': 'No hay usuarios registrados en Messages',
    'new_chat.add_by_number': 'Añadir por número',
    'new_chat.country': 'País',
    'new_chat.phone_number': 'Número de teléfono',
    'new_chat.verify_number': 'Verificar número',
    'new_chat.number_not_registered': 'Este número no está registrado en Messages',
    'new_chat.start_chat': 'Iniciar chat',
    'new_chat.whatsapp_numbers': 'Números WhatsApp',
    'new_chat.new_contact': 'Nuevo contacto',
    'settings.appearance': 'Apariencia',
    'appearance.title': 'Apariencia',
    'appearance.dark': 'Oscuro',
    'appearance.light': 'Claro',
    'appearance.description': 'Elige el tema de la aplicación',
  },
  en: {
    'tabs.calls': 'Calls',
    'tabs.chats': 'Chats',
    'tabs.groups': 'Groups',
    'tabs.settings': 'Settings',
    'tabs.linked_devices': 'Linked Devices',
    'tabs.notifications': 'Notifications',
    'common.search': 'Search',
    'common.continue': 'Continue',
    'common.refresh': 'Refresh',
    'common.sign_out': 'Sign out',
    'common.log_out': 'Log out',
    'common.photo': 'Photo',
    'common.video': 'Video',
    'welcome.headline': 'Welcome to WhatsApp Clone',
    'welcome.read_our': 'Read our',
    'welcome.privacy_policy': 'Privacy Policy',
    'welcome.tap_agree_continue': 'Tap "Agree & Continue" to accept the',
    'welcome.terms_of_service': 'Terms of Service',
    'welcome.agree_continue': 'Agree & Continue',
    'auth.sign_in': 'Sign in',
    'auth.subtitle': 'Continue to WhatsApp Clone',
    'auth.continue_google': 'Continue with Google',
    'auth.continue_apple': 'Continue with Apple',
    'auth.continue_phone': 'Continue with phone',
    'auth.legal': 'By continuing, you agree to our Terms and acknowledge our Privacy Policy.',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.account': 'Account',
    'settings.privacy': 'Privacy',
    'settings.chats': 'Chats',
    'settings.notifications': 'Notifications',
    'settings.storage_data': 'Storage and Data',
    'settings.broadcast_lists': 'Broadcast Lists',
    'settings.starred_messages': 'Starred Messages',
    'settings.linked_devices': 'Linked Devices',
    'settings.app_updates': 'App Updates',
    'settings.help': 'Help',
    'settings.tell_friend': 'Tell a Friend',
    'settings.log_out': 'Log Out',
    'language.title': 'Language',
    'language.select_title': 'Select your language',
    'language.select_subtitle': 'You can change it later.',
    'chats.no_conversations': 'No conversations yet',
    'chats.group': 'Group',
    'chats.chat': 'Chat',
    'account.title': 'Account',
    'account.not_signed_in': 'You are not signed in.',
    'account.go_to_sign_in': 'Go to sign in',
    'linked_devices.title': 'Linked Devices',
    'linked_devices.devices': 'Devices',
    'linked_devices.session_count_singular': 'active session',
    'linked_devices.session_count_plural': 'active sessions',
    'linked_devices.tap_refresh': 'Tap refresh to load sessions',
    'linked_devices.no_sessions_loaded': 'No sessions loaded.',
    'linked_devices.no_active_sessions': 'No active sessions.',
    'linked_devices.this_device': 'This device',
    'linked_devices.session': 'Session',
    'linked_devices.status': 'Status',
    'linked_devices.last_active': 'Last active',
    'linked_devices.expires': 'Expires',
    'linked_devices.footer': 'This is backed by your account sessions (same identity used by the Messages backend).',
    'link_device.title': 'Link a device',
    'link_device.cta': 'Link a device',
    'link_device.scan_title': 'Scan the QR code',
    'link_device.scan_description': 'Point your camera at the QR code shown in Messages (web).',
    'link_device.approving': 'Linking...',
    'link_device.camera_title': 'Camera permission',
    'link_device.camera_description': 'We need camera access to scan the QR code.',
    'link_device.grant_permission': 'Allow camera',
    'link_device.confirm_title': 'Link device?',
    'link_device.confirm_message': 'You are about to sign in to Messages on this browser. Continue?',
    'link_device.cancel': 'Cancel',
    'link_device.confirm_action': 'Link',
    'link_device.success_title': 'Device linked',
    'link_device.success_message': 'You can now use Messages on this browser.',
    'link_device.error_title': 'Unable to link',
    'link_device.error_message': 'The code is invalid or expired. Please try again.',
    'link_device.biometric_unavailable_title': 'Biometrics unavailable',
    'link_device.biometric_unavailable_message': 'Enable Face ID/Touch ID (or fingerprint) on your phone to link devices.',
    'link_device.biometric_prompt': 'Confirm your identity to link this device',
    'link_device.biometric_fallback': 'Use device passcode',
    'link_device.biometric_failed_title': 'Not verified',
    'link_device.biometric_failed_message': 'We could not verify your identity. Please try again.',
    'app_updates.title': 'App Updates',
    'app_updates.current_version': 'Current version',
    'app_updates.auto_update': 'Auto-update',
    'app_updates.auto_update_subtitle': 'At night, check and install updates if a new version is available.',
    'app_updates.auto_update_ios_subtitle': 'At night, check for updates and notify you to download.',
    'app_updates.notify': 'Update notifications',
    'app_updates.notify_subtitle': 'If a new version is available, you will get a notification.',
    'app_updates.notify_disabled_subtitle': 'Turn off auto-update to control notifications.',
    'app_updates.permission_title': 'Notifications permission',
    'app_updates.permission_message': 'Enable notifications to be notified when an update is available.',
    'otp.title': 'Enter your phone number',
    'otp.description': 'WhatsApp will need to verify your account. Carrier charges may apply.',
    'otp.phone_placeholder': 'Phone number',
    'otp.sending_code': 'Sending code...',
    'otp.next': 'Next',
    'otp.select_country': 'Select country',
    'verify.sms_sent': 'We have sent you an SMS with a code to the number above.',
    'verify.enter_code': 'To complete your phone number verification, please enter the 6-digit activation code.',
    'verify.resend': "Didn't receive a verification code?",
    'new_chat.title': 'New Chat',
    'new_chat.search_placeholder': 'Search name or number',
    'notifications.title': 'Notifications',
    'notifications.messages': 'Messages',
    'notifications.messages_subtitle': 'Notifications for 1:1 chats',
    'notifications.groups': 'Groups',
    'notifications.groups_subtitle': 'Notifications for group chats',
    'notifications.sound': 'Sound',
    'notifications.sound_subtitle': 'Play a sound for notifications',
    'notifications.vibration': 'Vibration',
    'notifications.vibration_subtitle': 'Vibrate when receiving a message',
    'notifications.previews': 'Previews',
    'notifications.previews_subtitle': 'Show message content in notifications',
    'common.cancel': 'Cancel',
    'phone_numbers.title': 'Phone numbers',
    'phone_numbers.your_numbers': 'Your numbers',
    'phone_numbers.add_existing': 'Add existing number',
    'phone_numbers.number_placeholder': '+1 555 000 0000',
    'phone_numbers.label_placeholder': 'Label (optional)',
    'phone_numbers.add': 'Add',
    'phone_numbers.add_error': 'Error adding number',
    'phone_numbers.active': 'Active',
    'phone_numbers.pending': 'Pending',
    'phone_numbers.default': 'Default',
    'phone_numbers.delete': 'Delete',
    'phone_numbers.delete_title': 'Delete number',
    'phone_numbers.delete_message': 'Are you sure you want to delete this number?',
    'phone_numbers.request_new': 'Request new number',
    'phone_numbers.didww_info': 'If you do not have a number, we can provide as many as you need via DIDWW.',
    'phone_numbers.didww_description': 'This feature requires a DIDWW account with balance. Contact the administrator.',
    'phone_numbers.didww_steps_title': 'Steps to activate DIDWW:',
    'phone_numbers.didww_step_1': 'Create an account at didww.com',
    'phone_numbers.didww_step_2': 'Deposit balance into your account',
    'phone_numbers.didww_step_3': 'Set the API key in environment variables',
    'phone_numbers.didww_step_4': 'Come back here to request numbers automatically',
    'phone_numbers.understood': 'Understood',
    'phone_numbers.no_numbers': 'You do not have any phone numbers yet.',
    'phone_numbers.set_default': 'Set as default',
    'phone_numbers.already_linked': 'This number is already linked to another account.',
    'phone_numbers.check_error': 'Error checking number.',
    'phone_numbers.embedded_signup': 'WhatsApp Business Verification',
    'phone_numbers.missing_config': 'Missing EXPO_PUBLIC_META_APP_ID or EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID in .env file',
    'phone_numbers.verify_whatsapp': 'Verify with WhatsApp',
    'phone_numbers.checking': 'Checking number...',
    'phone_numbers.verify_description': 'To add this number, you must first verify it via WhatsApp Business Embedded Signup.',
    'phone_numbers.number_to_verify': 'Number to verify',
    'phone_numbers.open_signup': 'Open WhatsApp Verification',
    'phone_numbers.already_verified': 'I have already verified',
    'phone_numbers.cancel': 'Cancel',
    'phone_numbers.enter_credentials': 'Enter WhatsApp Credentials',
    'phone_numbers.credentials_description': 'Enter the access token and number identifier you received after verification.',
    'phone_numbers.token_placeholder': 'Access token (EAAXX...)',
    'phone_numbers.phone_id_placeholder': 'Phone number ID (1XXXXXXXX...)',
    'phone_numbers.adding': 'Adding number...',
    'menu.new_group': 'New Group',
    'menu.linked_devices': 'Linked Devices',
    'menu.mark_all_read': 'Mark All as Read',
    'menu.settings': 'Settings',
    'header.messages': 'Messages',
    'new_chat.contacts_on_messages': 'Contacts on Messages',
    'new_chat.search_name_or_number': 'Search name or number',
    'new_chat.no_users': 'No users registered on Messages',
    'new_chat.add_by_number': 'Add by number',
    'new_chat.country': 'Country',
    'new_chat.phone_number': 'Phone number',
    'new_chat.verify_number': 'Verify number',
    'new_chat.number_not_registered': 'This number is not registered on Messages',
    'new_chat.start_chat': 'Start chat',
    'new_chat.whatsapp_numbers': 'WhatsApp numbers',
    'new_chat.new_contact': 'New contact',
    'settings.appearance': 'Appearance',
    'appearance.title': 'Appearance',
    'appearance.dark': 'Dark',
    'appearance.light': 'Light',
    'appearance.description': 'Choose the app theme',
  },
  de: {
    'tabs.calls': 'Anrufe',
    'tabs.chats': 'Chats',
    'tabs.groups': 'Gruppen',
    'tabs.settings': 'Einstellungen',
    'tabs.linked_devices': 'Verknüpfte Geräte',
    'tabs.notifications': 'Benachrichtigungen',
    'common.search': 'Suchen',
    'common.continue': 'Weiter',
    'common.refresh': 'Aktualisieren',
    'common.sign_out': 'Abmelden',
    'common.log_out': 'Abmelden',
    'common.photo': 'Foto',
    'common.video': 'Video',
    'welcome.headline': 'Willkommen bei WhatsApp Clone',
    'welcome.read_our': 'Lies unsere',
    'welcome.privacy_policy': 'Datenschutzrichtlinie',
    'welcome.tap_agree_continue': 'Tippe auf "Zustimmen & Fortfahren", um die',
    'welcome.terms_of_service': 'Nutzungsbedingungen',
    'welcome.agree_continue': 'Zustimmen & Fortfahren',
    'auth.sign_in': 'Anmelden',
    'auth.subtitle': 'Weiter zu WhatsApp Clone',
    'auth.continue_google': 'Mit Google fortfahren',
    'auth.continue_apple': 'Mit Apple fortfahren',
    'auth.continue_phone': 'Mit Telefon fortfahren',
    'auth.legal': 'Wenn du fortfährst, stimmst du unseren Bedingungen zu und erkennst unsere Datenschutzrichtlinie an.',
    'settings.title': 'Einstellungen',
    'settings.language': 'Sprache',
    'settings.account': 'Konto',
    'settings.privacy': 'Datenschutz',
    'settings.chats': 'Chats',
    'settings.notifications': 'Benachrichtigungen',
    'settings.storage_data': 'Speicher und Daten',
    'settings.broadcast_lists': 'Broadcast-Listen',
    'settings.starred_messages': 'Markierte Nachrichten',
    'settings.linked_devices': 'Verknüpfte Geräte',
    'settings.app_updates': 'App-Updates',
    'settings.help': 'Hilfe',
    'settings.tell_friend': 'Freund einladen',
    'settings.log_out': 'Abmelden',
    'language.title': 'Sprache',
    'language.select_title': 'Sprache auswählen',
    'language.select_subtitle': 'Du kannst sie später ändern.',
    'chats.no_conversations': 'Noch keine Unterhaltungen',
    'chats.group': 'Gruppe',
    'chats.chat': 'Chat',
    'account.title': 'Konto',
    'account.not_signed_in': 'Du bist nicht angemeldet.',
    'account.go_to_sign_in': 'Zur Anmeldung',
    'linked_devices.title': 'Verknüpfte Geräte',
    'linked_devices.devices': 'Geräte',
    'linked_devices.session_count_singular': 'aktive Sitzung',
    'linked_devices.session_count_plural': 'aktive Sitzungen',
    'linked_devices.tap_refresh': 'Zum Laden aktualisieren',
    'linked_devices.no_sessions_loaded': 'Keine Sitzungen geladen.',
    'linked_devices.no_active_sessions': 'Keine aktiven Sitzungen.',
    'linked_devices.this_device': 'Dieses Gerät',
    'linked_devices.session': 'Sitzung',
    'linked_devices.status': 'Status',
    'linked_devices.last_active': 'Zuletzt aktiv',
    'linked_devices.expires': 'Läuft ab',
    'linked_devices.footer': 'Dies basiert auf deinen Kontositzungen (dieselbe Identität wie im Messages-Backend).',
    'link_device.title': 'Gerät verknüpfen',
    'link_device.cta': 'Gerät verknüpfen',
    'link_device.scan_title': 'QR-Code scannen',
    'link_device.scan_description': 'Richte deine Kamera auf den QR-Code in Messages (Web).',
    'link_device.approving': 'Verknüpfen...',
    'link_device.camera_title': 'Kameraberechtigung',
    'link_device.camera_description': 'Wir benötigen Zugriff auf die Kamera, um den QR-Code zu scannen.',
    'link_device.grant_permission': 'Kamera erlauben',
    'link_device.confirm_title': 'Gerät verknüpfen?',
    'link_device.confirm_message': 'Du meldest dich gleich in Messages in diesem Browser an. Fortfahren?',
    'link_device.cancel': 'Abbrechen',
    'link_device.confirm_action': 'Verknüpfen',
    'link_device.success_title': 'Gerät verknüpft',
    'link_device.success_message': 'Du kannst Messages jetzt in diesem Browser verwenden.',
    'link_device.error_title': 'Verknüpfen fehlgeschlagen',
    'link_device.error_message': 'Der Code ist ungültig oder abgelaufen. Bitte versuche es erneut.',
    'link_device.biometric_unavailable_title': 'Biometrie nicht verfügbar',
    'link_device.biometric_unavailable_message': 'Aktiviere Face ID/Touch ID (oder Fingerabdruck), um Geräte zu verknüpfen.',
    'link_device.biometric_prompt': 'Bestätige deine Identität, um das Gerät zu verknüpfen',
    'link_device.biometric_fallback': 'Gerätecode verwenden',
    'link_device.biometric_failed_title': 'Nicht verifiziert',
    'link_device.biometric_failed_message': 'Deine Identität konnte nicht verifiziert werden. Bitte erneut versuchen.',
    'app_updates.title': 'App-Updates',
    'app_updates.current_version': 'Aktuelle Version',
    'app_updates.auto_update': 'Automatisch aktualisieren',
    'app_updates.auto_update_subtitle': 'Nachts nach Updates suchen und installieren, wenn verfügbar.',
    'app_updates.auto_update_ios_subtitle': 'Nachts nach Updates suchen und dich zum Download benachrichtigen.',
    'app_updates.notify': 'Update-Benachrichtigungen',
    'app_updates.notify_subtitle': 'Wenn eine neue Version verfügbar ist, erhältst du eine Benachrichtigung.',
    'app_updates.notify_disabled_subtitle': 'Deaktiviere Auto-Update, um Benachrichtigungen zu steuern.',
    'app_updates.permission_title': 'Benachrichtigungsberechtigung',
    'app_updates.permission_message': 'Aktiviere Benachrichtigungen, um Updates zu erhalten.',
    'otp.title': 'Telefonnummer eingeben',
    'otp.description': 'WhatsApp muss dein Konto verifizieren. Es können Gebühren anfallen.',
    'otp.phone_placeholder': 'Telefonnummer',
    'otp.sending_code': 'Code wird gesendet...',
    'otp.next': 'Weiter',
    'otp.select_country': 'Land auswählen',
    'verify.sms_sent': 'Wir haben dir eine SMS mit einem Code an die obige Nummer gesendet.',
    'verify.enter_code': 'Gib bitte den 6-stelligen Aktivierungscode ein, um die Verifizierung abzuschließen.',
    'verify.resend': 'Keinen Bestätigungscode erhalten?',
    'new_chat.title': 'Neuer Chat',
    'new_chat.search_placeholder': 'Name oder Nummer suchen',
    'notifications.title': 'Benachrichtigungen',
    'notifications.messages': 'Nachrichten',
    'notifications.messages_subtitle': 'Benachrichtigungen für 1:1 Chats',
    'notifications.groups': 'Gruppen',
    'notifications.groups_subtitle': 'Benachrichtigungen für Gruppen',
    'notifications.sound': 'Ton',
    'notifications.sound_subtitle': 'Ton abspielen',
    'notifications.vibration': 'Vibration',
    'notifications.vibration_subtitle': 'Beim Empfang vibrieren',
    'notifications.previews': 'Vorschau',
    'notifications.previews_subtitle': 'Nachrichteninhalt anzeigen',
    'common.cancel': 'Abbrechen',
    'phone_numbers.title': 'Telefonnummern',
    'phone_numbers.your_numbers': 'Deine Nummern',
    'phone_numbers.add_existing': 'Bestehende Nummer hinzufügen',
    'phone_numbers.number_placeholder': '+49 170 0000000',
    'phone_numbers.label_placeholder': 'Bezeichnung (optional)',
    'phone_numbers.add': 'Hinzufügen',
    'phone_numbers.add_error': 'Fehler beim Hinzufügen',
    'phone_numbers.active': 'Aktiv',
    'phone_numbers.pending': 'Ausstehend',
    'phone_numbers.default': 'Standard',
    'phone_numbers.delete': 'Löschen',
    'phone_numbers.delete_title': 'Nummer löschen',
    'phone_numbers.delete_message': 'Möchtest du diese Nummer wirklich löschen?',
    'phone_numbers.request_new': 'Neue Nummer anfordern',
    'phone_numbers.didww_info': 'Falls du keine Nummer hast, können wir dir so viele wie nötig über DIDWW bereitstellen.',
    'phone_numbers.didww_description': 'Diese Funktion erfordert ein DIDWW-Konto mit Guthaben. Kontaktiere den Administrator.',
    'phone_numbers.didww_steps_title': 'Schritte zur DIDWW-Aktivierung:',
    'phone_numbers.didww_step_1': 'Erstelle ein Konto auf didww.com',
    'phone_numbers.didww_step_2': 'Zahle Guthaben auf dein Konto ein',
    'phone_numbers.didww_step_3': 'Lege den API-Schlüssel in den Umgebungsvariablen fest',
    'phone_numbers.didww_step_4': 'Komme hierher zurück, um Nummern automatisch anzufordern',
    'phone_numbers.understood': 'Verstanden',
    'phone_numbers.no_numbers': 'Du hast noch keine Telefonnummern.',
    'phone_numbers.set_default': 'Als Standard festlegen',
    'phone_numbers.already_linked': 'Diese Nummer ist bereits mit einem anderen Konto verknüpft.',
    'phone_numbers.check_error': 'Fehler beim Überprüfen der Nummer.',
    'phone_numbers.embedded_signup': 'WhatsApp Business-Verifizierung',
    'phone_numbers.missing_config': 'EXPO_PUBLIC_META_APP_ID oder EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID fehlt in der .env-Datei',
    'phone_numbers.verify_whatsapp': 'Mit WhatsApp verifizieren',
    'phone_numbers.checking': 'Nummer wird überprüft...',
    'phone_numbers.verify_description': 'Um diese Nummer hinzuzufügen, musst du sie zuerst über WhatsApp Business Embedded Signup verifizieren.',
    'phone_numbers.number_to_verify': 'Zu verifizierende Nummer',
    'phone_numbers.open_signup': 'WhatsApp-Verifizierung öffnen',
    'phone_numbers.already_verified': 'Bereits verifiziert',
    'phone_numbers.cancel': 'Abbrechen',
    'phone_numbers.enter_credentials': 'WhatsApp-Anmeldedaten eingeben',
    'phone_numbers.credentials_description': 'Gib das Zugriffstoken und die Nummern-ID ein, die du nach der Verifizierung erhalten hast.',
    'phone_numbers.token_placeholder': 'Zugriffstoken (EAAXX...)',
    'phone_numbers.phone_id_placeholder': 'Telefonnummer-ID (1XXXXXXXX...)',
    'phone_numbers.adding': 'Nummer wird hinzugefügt...',
    'menu.new_group': 'Neue Gruppe',
    'menu.linked_devices': 'Verknüpfte Geräte',
    'menu.mark_all_read': 'Alle als gelesen markieren',
    'menu.settings': 'Einstellungen',
    'header.messages': 'Messages',
    'new_chat.contacts_on_messages': 'Kontakte auf Messages',
    'new_chat.search_name_or_number': 'Name oder Nummer suchen',
    'new_chat.no_users': 'Keine Benutzer in Messages registriert',
    'new_chat.add_by_number': 'Per Nummer hinzufügen',
    'new_chat.country': 'Land',
    'new_chat.phone_number': 'Telefonnummer',
    'new_chat.verify_number': 'Nummer überprüfen',
    'new_chat.number_not_registered': 'Diese Nummer ist nicht in Messages registriert',
    'new_chat.start_chat': 'Chat starten',
    'new_chat.whatsapp_numbers': 'WhatsApp-Nummern',
    'new_chat.new_contact': 'Neuer Kontakt',
    'settings.appearance': 'Erscheinungsbild',
    'appearance.title': 'Erscheinungsbild',
    'appearance.dark': 'Dunkel',
    'appearance.light': 'Hell',
    'appearance.description': 'Wähle das App-Design',
  },
  fr: {
    'tabs.calls': 'Appels',
    'tabs.chats': 'Discussions',
    'tabs.groups': 'Groupes',
    'tabs.settings': 'Réglages',
    'tabs.linked_devices': 'Appareils liés',
    'tabs.notifications': 'Notifications',
    'common.search': 'Rechercher',
    'common.continue': 'Continuer',
    'common.refresh': 'Actualiser',
    'common.sign_out': 'Se déconnecter',
    'common.log_out': 'Se déconnecter',
    'common.photo': 'Photo',
    'common.video': 'Vidéo',
    'welcome.headline': 'Bienvenue sur WhatsApp Clone',
    'welcome.read_our': 'Lisez notre',
    'welcome.privacy_policy': 'Politique de confidentialité',
    'welcome.tap_agree_continue': 'Appuyez sur "Accepter et continuer" pour accepter les',
    'welcome.terms_of_service': 'Conditions d’utilisation',
    'welcome.agree_continue': 'Accepter et continuer',
    'auth.sign_in': 'Se connecter',
    'auth.subtitle': 'Continuer vers WhatsApp Clone',
    'auth.continue_google': 'Continuer avec Google',
    'auth.continue_apple': 'Continuer avec Apple',
    'auth.continue_phone': 'Continuer avec téléphone',
    'auth.legal': 'En continuant, vous acceptez nos Conditions et reconnaissez notre Politique de confidentialité.',
    'settings.title': 'Réglages',
    'settings.language': 'Langue',
    'settings.account': 'Compte',
    'settings.privacy': 'Confidentialité',
    'settings.chats': 'Discussions',
    'settings.notifications': 'Notifications',
    'settings.storage_data': 'Stockage et données',
    'settings.broadcast_lists': 'Listes de diffusion',
    'settings.starred_messages': 'Messages favoris',
    'settings.linked_devices': 'Appareils liés',
    'settings.app_updates': 'Mises à jour de l’app',
    'settings.help': 'Aide',
    'settings.tell_friend': 'Inviter un ami',
    'settings.log_out': 'Se déconnecter',
    'language.title': 'Langue',
    'language.select_title': 'Choisissez votre langue',
    'language.select_subtitle': 'Vous pourrez la changer plus tard.',
    'chats.no_conversations': 'Aucune conversation pour le moment',
    'chats.group': 'Groupe',
    'chats.chat': 'Discussion',
    'account.title': 'Compte',
    'account.not_signed_in': 'Vous n’êtes pas connecté.',
    'account.go_to_sign_in': 'Aller à la connexion',
    'linked_devices.title': 'Appareils liés',
    'linked_devices.devices': 'Appareils',
    'linked_devices.session_count_singular': 'session active',
    'linked_devices.session_count_plural': 'sessions actives',
    'linked_devices.tap_refresh': 'Appuyez sur actualiser',
    'linked_devices.no_sessions_loaded': 'Aucune session chargée.',
    'linked_devices.no_active_sessions': 'Aucune session active.',
    'linked_devices.this_device': 'Cet appareil',
    'linked_devices.session': 'Session',
    'linked_devices.status': 'Statut',
    'linked_devices.last_active': 'Dernière activité',
    'linked_devices.expires': 'Expire',
    'linked_devices.footer': 'Basé sur les sessions de votre compte (même identité que le backend Messages).',
    'link_device.title': 'Lier un appareil',
    'link_device.cta': 'Lier un appareil',
    'link_device.scan_title': 'Scannez le QR code',
    'link_device.scan_description': 'Pointez votre caméra vers le QR code affiché dans Messages (web).',
    'link_device.approving': 'Association...',
    'link_device.camera_title': 'Autorisation caméra',
    'link_device.camera_description': 'Nous avons besoin de l’accès à la caméra pour scanner le QR code.',
    'link_device.grant_permission': 'Autoriser la caméra',
    'link_device.confirm_title': 'Lier l’appareil ?',
    'link_device.confirm_message': 'Vous allez vous connecter à Messages sur ce navigateur. Continuer ?',
    'link_device.cancel': 'Annuler',
    'link_device.confirm_action': 'Lier',
    'link_device.success_title': 'Appareil lié',
    'link_device.success_message': 'Vous pouvez maintenant utiliser Messages sur ce navigateur.',
    'link_device.error_title': 'Impossible de lier',
    'link_device.error_message': 'Le code est invalide ou expiré. Réessayez.',
    'link_device.biometric_unavailable_title': 'Biométrie indisponible',
    'link_device.biometric_unavailable_message': 'Activez Face ID/Touch ID (ou empreinte) pour lier des appareils.',
    'link_device.biometric_prompt': 'Confirmez votre identité pour lier cet appareil',
    'link_device.biometric_fallback': 'Utiliser le code de l’appareil',
    'link_device.biometric_failed_title': 'Non vérifié',
    'link_device.biometric_failed_message': 'Impossible de vérifier votre identité. Réessayez.',
    'app_updates.title': 'Mises à jour de l’app',
    'app_updates.current_version': 'Version actuelle',
    'app_updates.auto_update': 'Mettre à jour automatiquement',
    'app_updates.auto_update_subtitle': 'La nuit, rechercher et installer les mises à jour si une nouvelle version est disponible.',
    'app_updates.auto_update_ios_subtitle': 'La nuit, rechercher les mises à jour et te notifier pour télécharger.',
    'app_updates.notify': 'Notifications de mise à jour',
    'app_updates.notify_subtitle': 'Si une nouvelle version est disponible, tu recevras une notification.',
    'app_updates.notify_disabled_subtitle': 'Désactive la mise à jour auto pour gérer les notifications.',
    'app_updates.permission_title': 'Autorisation des notifications',
    'app_updates.permission_message': 'Active les notifications pour être averti lorsqu’une mise à jour est disponible.',
    'otp.title': 'Saisir votre numéro de téléphone',
    'otp.description': 'WhatsApp devra vérifier votre compte. Des frais opérateur peuvent s’appliquer.',
    'otp.phone_placeholder': 'Numéro de téléphone',
    'otp.sending_code': 'Envoi du code...',
    'otp.next': 'Suivant',
    'otp.select_country': 'Choisir un pays',
    'verify.sms_sent': 'Nous vous avons envoyé un SMS avec un code au numéro ci-dessus.',
    'verify.enter_code': 'Pour terminer la vérification, saisissez le code d’activation à 6 chiffres.',
    'verify.resend': "Vous n'avez pas reçu le code ?",
    'new_chat.title': 'Nouveau chat',
    'new_chat.search_placeholder': 'Rechercher un nom ou un numéro',
    'notifications.title': 'Notifications',
    'notifications.messages': 'Messages',
    'notifications.messages_subtitle': 'Notifications pour les discussions 1:1',
    'notifications.groups': 'Groupes',
    'notifications.groups_subtitle': 'Notifications pour les groupes',
    'notifications.sound': 'Son',
    'notifications.sound_subtitle': 'Jouer un son',
    'notifications.vibration': 'Vibration',
    'notifications.vibration_subtitle': 'Vibrer à la réception',
    'notifications.previews': 'Aperçus',
    'notifications.previews_subtitle': 'Afficher le contenu',
    'common.cancel': 'Annuler',
    'phone_numbers.title': 'Numéros de téléphone',
    'phone_numbers.your_numbers': 'Tes numéros',
    'phone_numbers.add_existing': 'Ajouter un numéro existant',
    'phone_numbers.number_placeholder': '+33 6 00 00 00 00',
    'phone_numbers.label_placeholder': 'Étiquette (optionnel)',
    'phone_numbers.add': 'Ajouter',
    'phone_numbers.add_error': 'Erreur lors de l\'ajout',
    'phone_numbers.active': 'Actif',
    'phone_numbers.pending': 'En attente',
    'phone_numbers.default': 'Par défaut',
    'phone_numbers.delete': 'Supprimer',
    'phone_numbers.delete_title': 'Supprimer le numéro',
    'phone_numbers.delete_message': 'Es-tu sûr de vouloir supprimer ce numéro ?',
    'phone_numbers.request_new': 'Demander un nouveau numéro',
    'phone_numbers.didww_info': 'Si tu n\'as pas de numéro, nous pouvons t\'en fournir autant que nécessaire via DIDWW.',
    'phone_numbers.didww_description': 'Cette fonctionnalité nécessite un compte DIDWW avec solde. Contacte l\'administrateur.',
    'phone_numbers.didww_steps_title': 'Étapes pour activer DIDWW :',
    'phone_numbers.didww_step_1': 'Crée un compte sur didww.com',
    'phone_numbers.didww_step_2': 'Dépose du solde sur ton compte',
    'phone_numbers.didww_step_3': 'Configure la clé API dans les variables d\'environnement',
    'phone_numbers.didww_step_4': 'Reviens ici pour demander des numéros automatiquement',
    'phone_numbers.understood': 'Compris',
    'phone_numbers.no_numbers': 'Tu n\'as encore aucun numéro de téléphone.',
    'phone_numbers.set_default': 'Définir par défaut',
    'phone_numbers.already_linked': 'Ce numéro est déjà lié à un autre compte.',
    'phone_numbers.check_error': 'Erreur lors de la vérification du numéro.',
    'phone_numbers.embedded_signup': 'Vérification WhatsApp Business',
    'phone_numbers.missing_config': 'EXPO_PUBLIC_META_APP_ID ou EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID manquant dans le fichier .env',
    'phone_numbers.verify_whatsapp': 'Vérifier avec WhatsApp',
    'phone_numbers.checking': 'Vérification du numéro...',
    'phone_numbers.verify_description': 'Pour ajouter ce numéro, tu dois d\'abord le vérifier via WhatsApp Business Embedded Signup.',
    'phone_numbers.number_to_verify': 'Numéro à vérifier',
    'phone_numbers.open_signup': 'Ouvrir la vérification WhatsApp',
    'phone_numbers.already_verified': 'Déjà vérifié',
    'phone_numbers.cancel': 'Annuler',
    'phone_numbers.enter_credentials': 'Saisir les identifiants WhatsApp',
    'phone_numbers.credentials_description': 'Saisis le jeton d\'accès et l\'identifiant du numéro reçus après la vérification.',
    'phone_numbers.token_placeholder': 'Jeton d\'accès (EAAXX...)',
    'phone_numbers.phone_id_placeholder': 'ID du numéro (1XXXXXXXX...)',
    'phone_numbers.adding': 'Ajout du numéro...',
    'menu.new_group': 'Nouveau groupe',
    'menu.linked_devices': 'Appareils liés',
    'menu.mark_all_read': 'Tout marquer comme lu',
    'menu.settings': 'Réglages',
    'header.messages': 'Messages',
    'new_chat.contacts_on_messages': 'Contacts sur Messages',
    'new_chat.search_name_or_number': 'Rechercher nom ou numéro',
    'new_chat.no_users': 'Aucun utilisateur enregistré sur Messages',
    'new_chat.add_by_number': 'Ajouter par numéro',
    'new_chat.country': 'Pays',
    'new_chat.phone_number': 'Numéro de téléphone',
    'new_chat.verify_number': 'Vérifier le numéro',
    'new_chat.number_not_registered': 'Ce numéro n\'est pas enregistré sur Messages',
    'new_chat.start_chat': 'Démarrer le chat',
    'new_chat.whatsapp_numbers': 'Numéros WhatsApp',
    'new_chat.new_contact': 'Nouveau contact',
    'settings.appearance': 'Apparence',
    'appearance.title': 'Apparence',
    'appearance.dark': 'Sombre',
    'appearance.light': 'Clair',
    'appearance.description': 'Choisis le thème de l\'application',
  },
  it: {
    'tabs.calls': 'Chiamate',
    'tabs.chats': 'Chat',
    'tabs.groups': 'Gruppi',
    'tabs.settings': 'Impostazioni',
    'tabs.linked_devices': 'Dispositivi collegati',
    'tabs.notifications': 'Notifiche',
    'common.search': 'Cerca',
    'common.continue': 'Continua',
    'common.refresh': 'Aggiorna',
    'common.sign_out': 'Disconnetti',
    'common.log_out': 'Disconnetti',
    'common.photo': 'Foto',
    'common.video': 'Video',
    'welcome.headline': 'Benvenuto su WhatsApp Clone',
    'welcome.read_our': 'Leggi la nostra',
    'welcome.privacy_policy': 'Informativa sulla privacy',
    'welcome.tap_agree_continue': 'Tocca "Accetta e continua" per accettare i',
    'welcome.terms_of_service': 'Termini di servizio',
    'welcome.agree_continue': 'Accetta e continua',
    'auth.sign_in': 'Accedi',
    'auth.subtitle': 'Continua su WhatsApp Clone',
    'auth.continue_google': 'Continua con Google',
    'auth.continue_apple': 'Continua con Apple',
    'auth.continue_phone': 'Continua con telefono',
    'auth.legal': 'Continuando, accetti i Termini e riconosci la Politica sulla privacy.',
    'settings.title': 'Impostazioni',
    'settings.language': 'Lingua',
    'settings.account': 'Account',
    'settings.privacy': 'Privacy',
    'settings.chats': 'Chat',
    'settings.notifications': 'Notifiche',
    'settings.storage_data': 'Archiviazione e dati',
    'settings.broadcast_lists': 'Liste broadcast',
    'settings.starred_messages': 'Messaggi con stella',
    'settings.linked_devices': 'Dispositivi collegati',
    'settings.app_updates': 'Aggiornamenti app',
    'settings.help': 'Aiuto',
    'settings.tell_friend': 'Invita un amico',
    'settings.log_out': 'Disconnetti',
    'language.title': 'Lingua',
    'language.select_title': 'Seleziona la lingua',
    'language.select_subtitle': 'Puoi cambiarla più tardi.',
    'chats.no_conversations': 'Nessuna conversazione',
    'chats.group': 'Gruppo',
    'chats.chat': 'Chat',
    'account.title': 'Account',
    'account.not_signed_in': 'Non hai effettuato l’accesso.',
    'account.go_to_sign_in': 'Vai al login',
    'linked_devices.title': 'Dispositivi collegati',
    'linked_devices.devices': 'Dispositivi',
    'linked_devices.session_count_singular': 'sessione attiva',
    'linked_devices.session_count_plural': 'sessioni attive',
    'linked_devices.tap_refresh': 'Tocca aggiorna per caricare',
    'linked_devices.no_sessions_loaded': 'Nessuna sessione caricata.',
    'linked_devices.no_active_sessions': 'Nessuna sessione attiva.',
    'linked_devices.this_device': 'Questo dispositivo',
    'linked_devices.session': 'Sessione',
    'linked_devices.status': 'Stato',
    'linked_devices.last_active': 'Ultima attività',
    'linked_devices.expires': 'Scade',
    'linked_devices.footer': 'Basato sulle sessioni del tuo account (stessa identità usata dal backend Messages).',
    'link_device.title': 'Collega un dispositivo',
    'link_device.cta': 'Collega un dispositivo',
    'link_device.scan_title': 'Scansiona il codice QR',
    'link_device.scan_description': 'Inquadra il codice QR mostrato in Messages (web).',
    'link_device.approving': 'Collegamento...',
    'link_device.camera_title': 'Permesso fotocamera',
    'link_device.camera_description': 'Serve l’accesso alla fotocamera per scansionare il codice QR.',
    'link_device.grant_permission': 'Consenti fotocamera',
    'link_device.confirm_title': 'Collegare il dispositivo?',
    'link_device.confirm_message': 'Stai per accedere a Messages su questo browser. Continuare?',
    'link_device.cancel': 'Annulla',
    'link_device.confirm_action': 'Collega',
    'link_device.success_title': 'Dispositivo collegato',
    'link_device.success_message': 'Ora puoi usare Messages su questo browser.',
    'link_device.error_title': 'Impossibile collegare',
    'link_device.error_message': 'Il codice non è valido o è scaduto. Riprova.',
    'link_device.biometric_unavailable_title': 'Biometria non disponibile',
    'link_device.biometric_unavailable_message': 'Attiva Face ID/Touch ID (o impronta) sul telefono per collegare dispositivi.',
    'link_device.biometric_prompt': 'Conferma la tua identità per collegare il dispositivo',
    'link_device.biometric_fallback': 'Usa il codice del dispositivo',
    'link_device.biometric_failed_title': 'Non verificato',
    'link_device.biometric_failed_message': 'Non è stato possibile verificare la tua identità. Riprova.',
    'app_updates.title': 'Aggiornamenti app',
    'app_updates.current_version': 'Versione attuale',
    'app_updates.auto_update': 'Aggiorna automaticamente',
    'app_updates.auto_update_subtitle': 'Di notte, controlla e installa gli aggiornamenti se disponibili.',
    'app_updates.auto_update_ios_subtitle': 'Di notte, controlla gli aggiornamenti e avvisati per scaricare.',
    'app_updates.notify': 'Notifiche aggiornamenti',
    'app_updates.notify_subtitle': 'Se è disponibile una nuova versione, riceverai una notifica.',
    'app_updates.notify_disabled_subtitle': 'Disattiva l’aggiornamento automatico per gestire le notifiche.',
    'app_updates.permission_title': 'Permesso notifiche',
    'app_updates.permission_message': 'Attiva le notifiche per essere avvisato quando è disponibile un aggiornamento.',
    'otp.title': 'Inserisci il tuo numero di telefono',
    'otp.description': 'WhatsApp deve verificare il tuo account. Potrebbero essere applicati costi del gestore.',
    'otp.phone_placeholder': 'Numero di telefono',
    'otp.sending_code': 'Invio del codice...',
    'otp.next': 'Avanti',
    'otp.select_country': 'Seleziona paese',
    'verify.sms_sent': 'Ti abbiamo inviato un SMS con un codice al numero sopra.',
    'verify.enter_code': 'Per completare la verifica, inserisci il codice di attivazione a 6 cifre.',
    'verify.resend': 'Non hai ricevuto il codice di verifica?',
    'new_chat.title': 'Nuova chat',
    'new_chat.search_placeholder': 'Cerca nome o numero',
    'notifications.title': 'Notifiche',
    'notifications.messages': 'Messaggi',
    'notifications.messages_subtitle': 'Notifiche per chat 1:1',
    'notifications.groups': 'Gruppi',
    'notifications.groups_subtitle': 'Notifiche per chat di gruppo',
    'notifications.sound': 'Suono',
    'notifications.sound_subtitle': 'Riproduci un suono',
    'notifications.vibration': 'Vibrazione',
    'notifications.vibration_subtitle': 'Vibra alla ricezione',
    'notifications.previews': 'Anteprime',
    'notifications.previews_subtitle': 'Mostra contenuto',
    'common.cancel': 'Annulla',
    'phone_numbers.title': 'Numeri di telefono',
    'phone_numbers.your_numbers': 'I tuoi numeri',
    'phone_numbers.add_existing': 'Aggiungi numero esistente',
    'phone_numbers.number_placeholder': '+39 333 000 0000',
    'phone_numbers.label_placeholder': 'Etichetta (opzionale)',
    'phone_numbers.add': 'Aggiungi',
    'phone_numbers.add_error': 'Errore durante l\'aggiunta',
    'phone_numbers.active': 'Attivo',
    'phone_numbers.pending': 'In attesa',
    'phone_numbers.default': 'Predefinito',
    'phone_numbers.delete': 'Elimina',
    'phone_numbers.delete_title': 'Elimina numero',
    'phone_numbers.delete_message': 'Sei sicuro di voler eliminare questo numero?',
    'phone_numbers.request_new': 'Richiedi nuovo numero',
    'phone_numbers.didww_info': 'Se non hai un numero, possiamo fornirti quanti ne hai bisogno tramite DIDWW.',
    'phone_numbers.didww_description': 'Questa funzionalità richiede un account DIDWW con saldo. Contatta l\'amministratore.',
    'phone_numbers.didww_steps_title': 'Passaggi per attivare DIDWW:',
    'phone_numbers.didww_step_1': 'Crea un account su didww.com',
    'phone_numbers.didww_step_2': 'Deposita saldo sul tuo account',
    'phone_numbers.didww_step_3': 'Configura la chiave API nelle variabili d\'ambiente',
    'phone_numbers.didww_step_4': 'Torna qui per richiedere numeri automaticamente',
    'phone_numbers.understood': 'Capito',
    'phone_numbers.no_numbers': 'Non hai ancora numeri di telefono.',
    'phone_numbers.set_default': 'Imposta come predefinito',
    'phone_numbers.already_linked': 'Questo numero è già collegato a un altro account.',
    'phone_numbers.check_error': 'Errore durante la verifica del numero.',
    'phone_numbers.embedded_signup': 'Verifica WhatsApp Business',
    'phone_numbers.missing_config': 'Manca EXPO_PUBLIC_META_APP_ID o EXPO_PUBLIC_META_EMBEDDED_CONFIG_ID nel file .env',
    'phone_numbers.verify_whatsapp': 'Verifica con WhatsApp',
    'phone_numbers.checking': 'Verifica del numero...',
    'phone_numbers.verify_description': 'Per aggiungere questo numero, devi prima verificarlo tramite WhatsApp Business Embedded Signup.',
    'phone_numbers.number_to_verify': 'Numero da verificare',
    'phone_numbers.open_signup': 'Apri verifica WhatsApp',
    'phone_numbers.already_verified': 'Già verificato',
    'phone_numbers.cancel': 'Annulla',
    'phone_numbers.enter_credentials': 'Inserisci le credenziali WhatsApp',
    'phone_numbers.credentials_description': 'Inserisci il token di accesso e l\'identificatore del numero ricevuti dopo la verifica.',
    'phone_numbers.token_placeholder': 'Token di accesso (EAAXX...)',
    'phone_numbers.phone_id_placeholder': 'ID numero telefono (1XXXXXXXX...)',
    'phone_numbers.adding': 'Aggiunta del numero...',
    'menu.new_group': 'Nuovo gruppo',
    'menu.linked_devices': 'Dispositivi collegati',
    'menu.mark_all_read': 'Segna tutto come letto',
    'menu.settings': 'Impostazioni',
    'header.messages': 'Messages',
    'new_chat.contacts_on_messages': 'Contatti su Messages',
    'new_chat.search_name_or_number': 'Cerca nome o numero',
    'new_chat.no_users': 'Nessun utente registrato su Messages',
    'new_chat.add_by_number': 'Aggiungi per numero',
    'new_chat.country': 'Paese',
    'new_chat.phone_number': 'Numero di telefono',
    'new_chat.verify_number': 'Verifica numero',
    'new_chat.number_not_registered': 'Questo numero non è registrato su Messages',
    'new_chat.start_chat': 'Avvia chat',
    'new_chat.whatsapp_numbers': 'Numeri WhatsApp',
    'new_chat.new_contact': 'Nuovo contatto',
    'settings.appearance': 'Aspetto',
    'appearance.title': 'Aspetto',
    'appearance.dark': 'Scuro',
    'appearance.light': 'Chiaro',
    'appearance.description': 'Scegli il tema dell\'app',
  },
};

type I18nContextValue = {
  language: AppLanguage;
  isLoaded: boolean;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const getStoredLanguage = async (): Promise<AppLanguage> => {
  try {
    if (Platform.OS === 'web') {
      return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    }

    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    return normalizeLanguage(stored);
  } catch {
    return 'es';
  }
};

const setStoredLanguage = async (lang: AppLanguage) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEY, lang);
      return;
    }

    await SecureStore.setItemAsync(STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors; language will still apply in-memory for this session.
  }
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (Platform.OS !== 'web') return 'es';
    try {
      return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
    } catch {
      return 'es';
    }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await getStoredLanguage();
      if (cancelled) return;
      setLanguageState(stored);
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    const normalized = normalizeLanguage(lang);
    setLanguageState(normalized);
    await setStoredLanguage(normalized);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const table = translations[language] ?? translations.es;
      return table[key] ?? translations.es[key] ?? key;
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(() => ({ language, isLoaded, setLanguage, t }), [language, isLoaded, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
