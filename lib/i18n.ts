export type Locale = "es" | "en" | "de" | "fr" | "zh"

export const translations = {
  es: {
    // Navigation & General
    restaurantName: "Cocina Dominicana Premium",
    welcome: "Bienvenidos/as a",
    language: "Idioma",
    table: "Mesa",
    subtitle: "Auténtica cocina caribeña",
    backToHome: "Volver al Inicio",

    // Table Selection
    tableSelection: "Selección de Mesa",
    tableNumber: "Número de Mesa",
    tableNumberPlaceholder: "Ingrese el número de mesa",
    continueToMenu: "Ver Menú",
    selectTable: "Seleccione su mesa para comenzar",

    // Menu Navigation
    search: "Buscar platos...",
    categories: {
      all: "Todo",
      starters: "Entrantes",
      mains: "Platos Principales",
      desserts: "Postres",
      drinks: "Bebidas",
      carnes: "Carnes",
    },

    // Filters
    filters: "Filtros",
    glutenFree: "Sin Gluten",
    vegan: "Vegano",
    spicy: "Picante",

    // Dish Details
    addToCart: "Añadir al Carrito",
    choose: "Elegir",
    quantity: "Cantidad",
    variants: "Variantes",
    personalizations: "Personalizar",
    notes: "Notas para cocina",
    addNotes: "Añadir/Editar nota",
    hideNotes: "Ocultar nota",
    notesPlaceholder: "Instrucciones especiales...",
    allergens: "Alérgenos",
    price: "Precio",
    free: "Gratis",
    editItem: "Editar Artículo",
    updateItem: "Actualizar Artículo",
    addedToCart: "Añadido al carrito",
    maxCharacters: "Máximo de caracteres",
    readMore: "Leer más",
    moreInfo: "Más información",
    needMoreInfoAbout: "Necesito más información sobre:",
    callWaiter: "Llamar al camarero",
    requestBill: "Solicitar la cuenta",
    rateService: "Valorar servicio",
    cancel: "Cancelar",
    none: "Ninguno",
    notAvailableOnline: "No disponible para pedidos online",

    // Cart
    cart: "Carrito",
    viewCart: "Ver Carrito",
    emptyCart: "Carrito vacío",
    emptyCartMessage: "Añade algunos platos deliciosos",
    subtotal: "Subtotal",
    total: "Total",
    clearCart: "Vaciar Carrito",
    confirmOrder: "Confirmar Pedido",
    reviewOrder: "Revisar Pedido",

    // Order Flow
    orderSummary: "Resumen del Pedido",
    orderConfirmed: "¡Pedido Confirmado!",
    orderConfirmedDesc: "Su pedido ha sido enviado correctamente",
    orderId: "ID del Pedido",
    whatsappOpened: "WhatsApp se abrirá automáticamente",
    orderWillBeSent: "Su pedido será enviado al restaurante",
    whatsappWillOpen: "WhatsApp se abrirá para confirmar el pedido",
    processing: "Procesando...",
    confirmAndSend: "Confirmar y Enviar",
    sending: "Enviando...",
    orderError: "Error al enviar el pedido. Por favor, inténtalo nuevamente.",

    orderSuccessTitle: "¡Pedido Realizado con Éxito!",
    orderSuccessMessage: "Su pedido ha sido guardado correctamente",
    whatsappBenefitsTitle: "¿Desea enviar su pedido por WhatsApp?",
    whatsappBenefitsDesc: "Al enviar su pedido por WhatsApp recibirá:",
    whatsappBenefit1: "Confirmación inmediata del restaurante",
    whatsappBenefit2: "Actualizaciones en tiempo real del estado de su pedido",
    whatsappBenefit3: "Comunicación directa con el restaurante",
    sendViaWhatsApp: "Enviar por WhatsApp",
    noThanks: "No, gracias",
    continueWithoutWhatsApp: "Continuar sin WhatsApp",

    noConnection: "Sin conexión a internet",
    noConnectionDesc: "Verifica tu conexión WiFi o datos móviles",
    connectionRestored: "Conexión restaurada",
    connectionRestoredDesc: "Ya puedes continuar usando la aplicación",
    networkError: "Error de conexión",
    networkErrorDesc: "No hay conexión a internet. Verifica tu WiFi o datos móviles.",
    serverError: "Error del servidor",
    serverErrorDesc: "Hubo un problema con el servidor. Inténtalo de nuevo.",
    callWaiterError: "No se pudo contactar al camarero",
    callWaiterErrorOffline: "Sin conexión. Verifica tu internet e inténtalo de nuevo.",
    requestBillError: "No se pudo solicitar la cuenta",
    requestBillErrorOffline: "Sin conexión. Verifica tu internet e inténtalo de nuevo.",

    allergenNames: {
      Mariscos: "Mariscos",
      Gluten: "Gluten",
      lactosa: "Lactosa",
      pescado: "Pescado",
      "frutos secos": "Frutos Secos",
      huevos: "Huevos",
      soja: "Soja",
      sesamo: "Sésamo",
    },

    categoryNames: {
      entrantes: "Entrantes",
      principales: "Principales",
      postres: "Postres",
      bebidas: "Bebidas",
      carnes: "Carnes",
    },

    noResultsFound: "No hay resultados",
    noResultsMessage: "No hay platos que coincidan con tu búsqueda",
    clearSearch: "Limpiar búsqueda",

    confirmCallWaiter: "¿Confirmar llamada al camarero?",
    confirmCallWaiterDesc: "Se notificará al camarero que necesita asistencia en su mesa.",
    confirmRequestBill: "¿Confirmar solicitud de cuenta?",
    confirmRequestBillDesc: "Se solicitará la cuenta para su mesa.",
    confirm: "Confirmar",

    tip: "Propina",
    noTip: "Sin propina",
    addTip: "Añadir propina",
    customTip: "Personalizada",
    enterCustomAmount: "Ingrese cantidad personalizada",
    customTipPlaceholder: "0.00",
    currency: "€",

    sessionTimer: "Tiempo de sesión",
    sessionExpiring: "Sesión por expirar",
    sessionExpired: "Sesión expirada",
    sessionExpiringWarning: "Su sesión expirará en 5 minutos",
    sessionExpiredMessage: "Su sesión ha expirado",
    sessionExpiredRestaurant: "Debe escanear nuevamente el código QR para continuar",
    sessionExpiredOnline: "Solicite otro enlace de pedido online para continuar",
    timeRemaining: "Tiempo restante",

    // Table validation error messages
    tableNotFoundError: "Mesa no encontrada",
    tableNotFoundDesc:
      "Estimado/a usuario, su solicitud no puede ser procesada. Por favor, consulte con el personal del restaurante.",
    tableRequiredError: "Mesa requerida",
    tableRequiredDesc:
      "No se puede procesar el pedido sin una mesa válida. Por favor, consulte con el personal del restaurante.",

    // Menu loading error messages
    menuLoadingError: "Error al cargar el menú",
    menuLoadingErrorDesc: "No se pudo cargar el menú. Verifica tu conexión a internet.",
    retryLoading: "Actualizar",
    checkingConnection: "Verificando conexión...",
  },

  en: {
    // Navigation & General
    restaurantName: "Premium Dominican Cuisine",
    welcome: "Welcome to",
    language: "Language",
    table: "Table",
    subtitle: "Authentic Caribbean cuisine",
    backToHome: "Back to Home",

    tableSelection: "Table Selection",
    tableNumber: "Table Number",
    tableNumberPlaceholder: "Enter table number",
    continueToMenu: "View Menu",
    selectTable: "Select your table to begin",

    search: "Search dishes...",
    categories: {
      all: "All",
      starters: "Starters",
      mains: "Main Courses",
      desserts: "Desserts",
      drinks: "Drinks",
      carnes: "Meats",
    },

    filters: "Filters",
    glutenFree: "Gluten Free",
    vegan: "Vegan",
    spicy: "Spicy",

    addToCart: "Add to Cart",
    choose: "Choose",
    quantity: "Quantity",
    variants: "Variants",
    personalizations: "Customize",
    notes: "Kitchen Notes",
    addNotes: "Add/Edit note",
    hideNotes: "Hide note",
    notesPlaceholder: "Special instructions...",
    allergens: "Allergens",
    price: "Price",
    free: "Free",
    editItem: "Edit Item",
    updateItem: "Update Item",
    addedToCart: "Added to cart",
    maxCharacters: "Max characters",
    readMore: "Read more",
    moreInfo: "More info",
    needMoreInfoAbout: "I need more information about:",
    callWaiter: "Call waiter",
    requestBill: "Request bill",
    rateService: "Rate service",
    cancel: "Cancel",
    none: "None",
    notAvailableOnline: "Not available for online orders",

    cart: "Cart",
    viewCart: "View Cart",
    emptyCart: "Empty Cart",
    emptyCartMessage: "Add some delicious dishes",
    subtotal: "Subtotal",
    total: "Total",
    clearCart: "Clear Cart",
    confirmOrder: "Confirm Order",
    reviewOrder: "Review Order",

    orderSummary: "Order Summary",
    orderConfirmed: "Order Confirmed!",
    orderConfirmedDesc: "Your order has been sent successfully",
    orderId: "Order ID",
    whatsappOpened: "WhatsApp will open automatically",
    orderWillBeSent: "Your order will be sent to the restaurant",
    whatsappWillOpen: "WhatsApp will open to confirm the order",
    processing: "Processing...",
    confirmAndSend: "Confirm and Send",
    sending: "Sending...",
    orderError: "Error sending order. Please try again.",

    orderSuccessTitle: "Order Placed Successfully!",
    orderSuccessMessage: "Your order has been saved successfully",
    whatsappBenefitsTitle: "Would you like to send your order via WhatsApp?",
    whatsappBenefitsDesc: "By sending your order via WhatsApp you will receive:",
    whatsappBenefit1: "Immediate confirmation from the restaurant",
    whatsappBenefit2: "Real-time updates on your order status",
    whatsappBenefit3: "Direct communication with the restaurant",
    sendViaWhatsApp: "Send via WhatsApp",
    noThanks: "No, thanks",
    continueWithoutWhatsApp: "Continue without WhatsApp",

    noConnection: "No internet connection",
    noConnectionDesc: "Check your WiFi or mobile data",
    connectionRestored: "Connection restored",
    connectionRestoredDesc: "You can continue using the app",
    networkError: "Connection error",
    networkErrorDesc: "No internet connection. Check your WiFi or mobile data.",
    serverError: "Server error",
    serverErrorDesc: "There was a problem with the server. Please try again.",
    callWaiterError: "Could not contact waiter",
    callWaiterErrorOffline: "No connection. Check your internet and try again.",
    requestBillError: "Could not request bill",
    requestBillErrorOffline: "No connection. Check your internet and try again.",

    allergenNames: {
      Mariscos: "Seafood",
      Gluten: "Gluten",
      lactosa: "Lactose",
      pescado: "Fish",
      "frutos secos": "Nuts",
      huevos: "Eggs",
      soja: "Soy",
      sesamo: "Sesame",
    },

    categoryNames: {
      entrantes: "Starters",
      principales: "Main Courses",
      postres: "Desserts",
      bebidas: "Drinks",
      carnes: "Meats",
    },

    noResultsFound: "No results found",
    noResultsMessage: "No dishes match your search",
    clearSearch: "Clear search",

    confirmCallWaiter: "Confirm call waiter?",
    confirmCallWaiterDesc: "The waiter will be notified that you need assistance at your table.",
    confirmRequestBill: "Confirm request bill?",
    confirmRequestBillDesc: "The bill will be requested for your table.",
    confirm: "Confirm",

    tip: "Tip",
    noTip: "No tip",
    addTip: "Add tip",
    customTip: "Custom",
    enterCustomAmount: "Enter custom amount",
    customTipPlaceholder: "0.00",
    currency: "$",

    sessionTimer: "Session time",
    sessionExpiring: "Session expiring",
    sessionExpired: "Session expired",
    sessionExpiringWarning: "Your session will expire in 5 minutes",
    sessionExpiredMessage: "Your session has expired",
    sessionExpiredRestaurant: "Please scan the QR code again to continue",
    sessionExpiredOnline: "Request another online order link to continue",
    timeRemaining: "Time remaining",

    // Table validation error messages
    tableNotFoundError: "Table not found",
    tableNotFoundDesc: "Dear user, your request cannot be processed. Please consult with the restaurant staff.",
    tableRequiredError: "Table required",
    tableRequiredDesc: "Cannot process order without a valid table. Please consult with the restaurant staff.",

    // Menu loading error messages
    menuLoadingError: "Error loading menu",
    menuLoadingErrorDesc: "Could not load the menu. Check your internet connection.",
    retryLoading: "Refresh",
    checkingConnection: "Checking connection...",
  },

  de: {
    restaurantName: "Premium Dominikanische Küche",
    welcome: "Willkommen bei",
    language: "Sprache",
    table: "Tisch",
    subtitle: "Authentische karibische Küche",
    backToHome: "Zurück zur Startseite",

    tableSelection: "Tischauswahl",
    tableNumber: "Tischnummer",
    tableNumberPlaceholder: "Tischnummer eingeben",
    continueToMenu: "Menü anzeigen",
    selectTable: "Wählen Sie Ihren Tisch zum Beginnen",

    search: "Gerichte suchen...",
    categories: {
      all: "Alle",
      starters: "Vorspeisen",
      mains: "Hauptgerichte",
      desserts: "Desserts",
      drinks: "Getränke",
      carnes: "Fleischgerichte",
    },

    filters: "Filter",
    glutenFree: "Glutenfrei",
    vegan: "Vegan",
    spicy: "Scharf",

    addToCart: "In den Warenkorb",
    choose: "Wählen",
    quantity: "Menge",
    variants: "Varianten",
    personalizations: "Anpassen",
    notes: "Küchennotizen",
    addNotes: "Notiz hinzufügen/bearbeiten",
    hideNotes: "Notiz ausblenden",
    notesPlaceholder: "Spezielle Anweisungen...",
    allergens: "Allergene",
    price: "Preis",
    free: "Kostenlos",
    editItem: "Artikel bearbeiten",
    updateItem: "Artikel aktualisieren",
    addedToCart: "Zum Warenkorb hinzugefügt",
    maxCharacters: "Max. Zeichen",
    readMore: "Mehr lesen",
    moreInfo: "Mehr Infos",
    needMoreInfoAbout: "Ich benötige mehr Informationen über:",
    callWaiter: "Kellner rufen",
    requestBill: "Rechnung anfordern",
    rateService: "Service bewerten",
    cancel: "Abbrechen",
    none: "Keine",
    notAvailableOnline: "Nicht verfügbar für Online-Bestellungen",

    cart: "Warenkorb",
    viewCart: "Warenkorb anzeigen",
    emptyCart: "Warenkorb leeren",
    emptyCartMessage: "Fügen Sie köstliche Gerichte hinzu",
    subtotal: "Zwischensumme",
    total: "Gesamt",
    clearCart: "Warenkorb leeren",
    confirmOrder: "Bestellung bestätigen",
    reviewOrder: "Bestellung überprüfen",

    orderSummary: "Bestellübersicht",
    orderConfirmed: "Bestellung bestätigt!",
    orderConfirmedDesc: "Ihre Bestellung wurde erfolgreich gesendet",
    orderId: "Bestell-ID",
    whatsappOpened: "WhatsApp öffnet sich automatisch",
    orderWillBeSent: "Ihre Bestellung wird an das Restaurant gesendet",
    whatsappWillOpen: "WhatsApp öffnet sich zur Bestätigung der Bestellung",
    processing: "Verarbeitung...",
    confirmAndSend: "Bestätigen und Senden",
    sending: "Senden...",
    orderError: "Fehler beim Senden der Bestellung. Bitte versuchen Sie es erneut.",

    orderSuccessTitle: "Bestellung erfolgreich aufgegeben!",
    orderSuccessMessage: "Ihre Bestellung wurde erfolgreich gespeichert",
    whatsappBenefitsTitle: "Möchten Sie Ihre Bestellung per WhatsApp senden?",
    whatsappBenefitsDesc: "Durch das Senden Ihrer Bestellung per WhatsApp erhalten Sie:",
    whatsappBenefit1: "Sofortige Bestätigung vom Restaurant",
    whatsappBenefit2: "Echtzeit-Updates zum Status Ihrer Bestellung",
    whatsappBenefit3: "Direkte Kommunikation mit dem Restaurant",
    sendViaWhatsApp: "Per WhatsApp senden",
    noThanks: "Nein, danke",
    continueWithoutWhatsApp: "Ohne WhatsApp fortfahren",

    noConnection: "Keine Internetverbindung",
    noConnectionDesc: "Überprüfen Sie Ihr WLAN oder mobile Daten",
    connectionRestored: "Verbindung wiederhergestellt",
    connectionRestoredDesc: "Sie können die App weiter verwenden",
    networkError: "Verbindungsfehler",
    networkErrorDesc: "Keine Internetverbindung. Überprüfen Sie Ihr WLAN oder mobile Daten.",
    serverError: "Serverfehler",
    serverErrorDesc: "Es gab ein Problem mit dem Server. Bitte versuchen Sie es erneut.",
    callWaiterError: "Kellner konnte nicht kontaktiert werden",
    callWaiterErrorOffline: "Keine Verbindung. Überprüfen Sie Ihr Internet und versuchen Sie es erneut.",
    requestBillError: "Rechnung konnte nicht angefordert werden",
    requestBillErrorOffline: "Keine Verbindung. Überprüfen Sie Ihr Internet und versuchen Sie es erneut.",

    allergenNames: {
      Mariscos: "Meeresfrüchte",
      Gluten: "Gluten",
      lactosa: "Laktose",
      pescado: "Fisch",
      "frutos secos": "Nüsse",
      huevos: "Eier",
      soja: "Soja",
      sesamo: "Sesam",
    },

    categoryNames: {
      entrantes: "Vorspeisen",
      principales: "Hauptgerichte",
      postres: "Desserts",
      bebidas: "Getränke",
      carnes: "Fleischgerichte",
    },

    noResultsFound: "Keine Ergebnisse gefunden",
    noResultsMessage: "Keine Gerichte entsprechen Ihrer Suche",
    clearSearch: "Suche löschen",

    confirmCallWaiter: "Kellner rufen bestätigen?",
    confirmCallWaiterDesc: "Der Kellner wird benachrichtigt, dass Sie Hilfe an Ihrem Tisch benötigen.",
    confirmRequestBill: "Rechnung anfordern bestätigen?",
    confirmRequestBillDesc: "Die Rechnung wird für Ihren Tisch angefordert.",
    confirm: "Bestätigen",

    tip: "Trinkgeld",
    noTip: "Kein Trinkgeld",
    addTip: "Trinkgeld hinzufügen",
    customTip: "Benutzerdefiniert",
    enterCustomAmount: "Benutzerdefinierten Betrag eingeben",
    customTipPlaceholder: "0,00",
    currency: "€",

    sessionTimer: "Sitzungszeit",
    sessionExpiring: "Sitzung läuft ab",
    sessionExpired: "Sitzung abgelaufen",
    sessionExpiringWarning: "Ihre Sitzung läuft in 5 Minuten ab",
    sessionExpiredMessage: "Ihre Sitzung ist abgelaufen",
    sessionExpiredRestaurant: "Bitte scannen Sie den QR-Code erneut, um fortzufahren",
    sessionExpiredOnline: "Fordern Sie einen neuen Online-Bestelllink an, um fortzufahren",
    timeRemaining: "Verbleibende Zeit",

    // Table validation error messages
    tableNotFoundError: "Tisch nicht gefunden",
    tableNotFoundDesc:
      "Sehr geehrter Benutzer, Ihre Anfrage kann nicht bearbeitet werden. Bitte wenden Sie sich an das Restaurantpersonal.",
    tableRequiredError: "Tisch erforderlich",
    tableRequiredDesc:
      "Bestellung kann ohne gültigen Tisch nicht bearbeitet werden. Bitte wenden Sie sich an das Restaurantpersonal.",

    // Menu loading error messages
    menuLoadingError: "Fehler beim Laden des Menüs",
    menuLoadingErrorDesc: "Menü konnte nicht geladen werden. Überprüfen Sie Ihre Internetverbindung.",
    retryLoading: "Aktualisieren",
    checkingConnection: "Verbindung wird überprüft...",
  },

  fr: {
    restaurantName: "Cuisine Dominicaine Premium",
    welcome: "Bienvenue chez",
    language: "Langue",
    table: "Table",
    subtitle: "Cuisine caribéenne authentique",
    backToHome: "Retour à l'accueil",

    tableSelection: "Sélection de Table",
    tableNumber: "Numéro de Table",
    tableNumberPlaceholder: "Entrez le numéro de table",
    continueToMenu: "Voir le Menu",
    selectTable: "Sélectionnez votre table pour commencer",

    search: "Rechercher des plats...",
    categories: {
      all: "Tout",
      starters: "Entrées",
      mains: "Plats Principaux",
      desserts: "Desserts",
      drinks: "Boissons",
      carnes: "Viandes",
    },

    filters: "Filtres",
    glutenFree: "Sans Gluten",
    vegan: "Végétalien",
    spicy: "Épicé",

    addToCart: "Ajouter au Panier",
    choose: "Choisir",
    quantity: "Quantité",
    variants: "Variantes",
    personalizations: "Personnaliser",
    notes: "Notes de Cuisine",
    addNotes: "Ajouter/Modifier note",
    hideNotes: "Masquer note",
    notesPlaceholder: "Instructions spéciales...",
    allergens: "Allergènes",
    price: "Prix",
    free: "Gratuit",
    editItem: "Modifier l'Article",
    updateItem: "Mettre à jour l'Article",
    addedToCart: "Ajouté au panier",
    maxCharacters: "Max. caractères",
    readMore: "Lire plus",
    moreInfo: "Plus d'infos",
    needMoreInfoAbout: "J'ai besoin de plus d'informations sur:",
    callWaiter: "Appeler le serveur",
    requestBill: "Demander l'addition",
    rateService: "Évaluer le service",
    cancel: "Annuler",
    none: "Aucun",
    notAvailableOnline: "Non disponible pour les commandes en ligne",

    cart: "Panier",
    viewCart: "Voir le Panier",
    emptyCart: "Panier Vide",
    emptyCartMessage: "Ajoutez quelques plats délicieux",
    subtotal: "Sous-total",
    total: "Total",
    clearCart: "Vider le Panier",
    confirmOrder: "Confirmer la Commande",
    reviewOrder: "Réviser la Commande",

    orderSummary: "Résumé de la Commande",
    orderConfirmed: "Commande Confirmée!",
    orderConfirmedDesc: "Votre commande a été envoyée avec succès",
    orderId: "ID de Commande",
    whatsappOpened: "WhatsApp s'ouvrira automatiquement",
    orderWillBeSent: "Votre commande sera envoyée au restaurant",
    whatsappWillOpen: "WhatsApp s'ouvrira pour confirmer la commande",
    processing: "Traitement...",
    confirmAndSend: "Confirmer et Envoyer",
    sending: "Envoi...",
    orderError: "Erreur lors de l'envoi de la commande. Veuillez réessayer.",

    orderSuccessTitle: "Commande Passée avec Succès!",
    orderSuccessMessage: "Votre commande a été enregistrée avec succès",
    whatsappBenefitsTitle: "Souhaitez-vous envoyer votre commande via WhatsApp?",
    whatsappBenefitsDesc: "En envoyant votre commande via WhatsApp, vous recevrez:",
    whatsappBenefit1: "Confirmation immédiate du restaurant",
    whatsappBenefit2: "Mises à jour en temps réel sur l'état de votre commande",
    whatsappBenefit3: "Communication directe avec le restaurant",
    sendViaWhatsApp: "Envoyer via WhatsApp",
    noThanks: "Non, merci",
    continueWithoutWhatsApp: "Continuer sans WhatsApp",

    noConnection: "Pas de connexion Internet",
    noConnectionDesc: "Vérifiez votre WiFi ou données mobiles",
    connectionRestored: "Connexion rétablie",
    connectionRestoredDesc: "Vous pouvez continuer à utiliser l'application",
    networkError: "Erreur de connexion",
    networkErrorDesc: "Pas de connexion Internet. Vérifiez votre WiFi ou données mobiles.",
    serverError: "Erreur du serveur",
    serverErrorDesc: "Il y a eu un problème avec le serveur. Veuillez réessayer.",
    callWaiterError: "Impossible de contacter le serveur",
    callWaiterErrorOffline: "Pas de connexion. Vérifiez votre Internet et réessayez.",
    requestBillError: "Impossible de demander l'addition",
    requestBillErrorOffline: "Pas de connexion. Vérifiez votre Internet et réessayez.",

    allergenNames: {
      Mariscos: "Fruits de mer",
      Gluten: "Gluten",
      lactosa: "Lactose",
      pescado: "Poisson",
      "frutos secos": "Fruits à coque",
      huevos: "Œufs",
      soja: "Soja",
      sesamo: "Sésame",
    },

    categoryNames: {
      entrantes: "Entrées",
      principales: "Plats Principaux",
      postres: "Desserts",
      bebidas: "Boissons",
      carnes: "Viandes",
    },

    noResultsFound: "Aucun résultat trouvé",
    noResultsMessage: "Aucun plat ne correspond à votre recherche",
    clearSearch: "Effacer la recherche",

    confirmCallWaiter: "Confirmer l'appel du serveur?",
    confirmCallWaiterDesc: "Le serveur sera notifié que vous avez besoin d'aide à votre table.",
    confirmRequestBill: "Confirmer la demande d'addition?",
    confirmRequestBillDesc: "L'addition sera demandée pour votre table.",
    confirm: "Confirmer",

    tip: "Pourboire",
    noTip: "Pas de pourboire",
    addTip: "Ajouter un pourboire",
    customTip: "Personnalisé",
    enterCustomAmount: "Entrez le montant personnalisé",
    customTipPlaceholder: "0,00",
    currency: "€",

    sessionTimer: "Temps de session",
    sessionExpiring: "Session expire bientôt",
    sessionExpired: "Session expirée",
    sessionExpiringWarning: "Votre session expirera dans 5 minutes",
    sessionExpiredMessage: "Votre session a expiré",
    sessionExpiredRestaurant: "Veuillez scanner à nouveau le code QR pour continuer",
    sessionExpiredOnline: "Demandez un autre lien de commande en ligne pour continuer",
    timeRemaining: "Temps restant",

    // Table validation error messages
    tableNotFoundError: "Table introuvable",
    tableNotFoundDesc:
      "Cher utilisateur, votre demande ne peut pas être traitée. Veuillez consulter le personnel du restaurant.",
    tableRequiredError: "Table requise",
    tableRequiredDesc:
      "Impossible de traiter la commande sans une table valide. Veuillez consulter le personnel du restaurant.",

    // Menu loading error messages
    menuLoadingError: "Erreur de chargement du menu",
    menuLoadingErrorDesc: "Impossible de charger le menu. Vérifiez votre connexion Internet.",
    retryLoading: "Actualiser",
    checkingConnection: "Vérification de la connexion...",
  },

  zh: {
    restaurantName: "高级多米尼加料理",
    welcome: "欢迎来到",
    language: "语言",
    table: "桌子",
    subtitle: "正宗加勒比海料理",
    backToHome: "返回首页",

    tableSelection: "选择桌子",
    tableNumber: "桌号",
    tableNumberPlaceholder: "输入桌号",
    continueToMenu: "查看菜单",
    selectTable: "选择您的桌子开始",

    search: "搜索菜品...",
    categories: {
      all: "全部",
      starters: "开胃菜",
      mains: "主菜",
      desserts: "甜品",
      drinks: "饮品",
      carnes: "肉类",
    },

    filters: "筛选",
    glutenFree: "无麸质",
    vegan: "素食",
    spicy: "辣味",

    addToCart: "加入购物车",
    choose: "选择",
    quantity: "数量",
    variants: "变化",
    personalizations: "定制",
    notes: "厨房备注",
    addNotes: "添加/编辑备注",
    hideNotes: "隐藏备注",
    notesPlaceholder: "特殊说明...",
    allergens: "过敏原",
    price: "价格",
    free: "免费",
    editItem: "编辑项目",
    updateItem: "更新项目",
    addedToCart: "已加入购物车",
    maxCharacters: "最大字符数",
    readMore: "阅读更多",
    moreInfo: "更多信息",
    needMoreInfoAbout: "我需要更多关于以下信息：",
    callWaiter: "呼叫服务员",
    requestBill: "请求账单",
    rateService: "评价服务",
    cancel: "取消",
    none: "无",
    notAvailableOnline: "在线订单不可用",

    cart: "购物车",
    viewCart: "查看购物车",
    emptyCart: "清空购物车",
    emptyCartMessage: "添加一些美味菜品",
    subtotal: "小计",
    total: "总计",
    clearCart: "清空购物车",
    confirmOrder: "确认订单",
    reviewOrder: "查看订单",

    orderSummary: "订单摘要",
    orderConfirmed: "订单已确认！",
    orderConfirmedDesc: "您的订单已成功发送",
    orderId: "订单号",
    whatsappOpened: "WhatsApp将自动打开",
    orderWillBeSent: "您的订单将发送到餐厅",
    whatsappWillOpen: "WhatsApp将打开以确认订单",
    processing: "处理中...",
    confirmAndSend: "确认并发送",
    sending: "发送中...",
    orderError: "发送订单时出错。请重试。",

    orderSuccessTitle: "订单提交成功！",
    orderSuccessMessage: "您的订单已成功保存",
    whatsappBenefitsTitle: "您想通过WhatsApp发送订单吗？",
    whatsappBenefitsDesc: "通过WhatsApp发送订单，您将获得：",
    whatsappBenefit1: "餐厅的即时确认",
    whatsappBenefit2: "订单状态的实时更新",
    whatsappBenefit3: "与餐厅的直接沟通",
    sendViaWhatsApp: "通过WhatsApp发送",
    noThanks: "不用了，谢谢",
    continueWithoutWhatsApp: "不使用WhatsApp继续",

    noConnection: "无网络连接",
    noConnectionDesc: "检查您的WiFi或移动数据",
    connectionRestored: "连接已恢复",
    connectionRestoredDesc: "您可以继续使用应用程序",
    networkError: "连接错误",
    networkErrorDesc: "无网络连接。检查您的WiFi或移动数据。",
    serverError: "服务器错误",
    serverErrorDesc: "服务器出现问题。请重试。",
    callWaiterError: "无法联系服务员",
    callWaiterErrorOffline: "无连接。检查您的网络并重试。",
    requestBillError: "无法请求账单",
    requestBillErrorOffline: "无连接。检查您的网络并重试。",

    allergenNames: {
      Mariscos: "海鲜",
      Gluten: "麸质",
      lactosa: "乳糖",
      pescado: "鱼类",
      "frutos secos": "坚果",
      huevos: "鸡蛋",
      soja: "大豆",
      sesamo: "芝麻",
    },

    categoryNames: {
      entrantes: "开胃菜",
      principales: "主菜",
      postres: "甜品",
      bebidas: "饮品",
      carnes: "肉类",
    },

    noResultsFound: "未找到结果",
    noResultsMessage: "没有菜品符合您的搜索",
    clearSearch: "清除搜索",

    confirmCallWaiter: "确认呼叫服务员？",
    confirmCallWaiterDesc: "服务员将收到您在桌子需要帮助的通知。",
    confirmRequestBill: "确认请求账单？",
    confirmRequestBillDesc: "将为您的桌子请求账单。",
    confirm: "确认",

    tip: "小费",
    noTip: "无小费",
    addTip: "添加小费",
    customTip: "自定义",
    enterCustomAmount: "输入自定义金额",
    customTipPlaceholder: "0.00",
    currency: "¥",

    sessionTimer: "会话时间",
    sessionExpiring: "会话即将过期",
    sessionExpired: "会话已过期",
    sessionExpiringWarning: "您的会话将在5分钟后过期",
    sessionExpiredMessage: "您的会话已过期",
    sessionExpiredRestaurant: "请重新扫描二维码以继续",
    sessionExpiredOnline: "请求另一个在线订单链接以继续",
    timeRemaining: "剩余时间",

    // Table validation error messages
    tableNotFoundError: "未找到桌子",
    tableNotFoundDesc: "尊敬的用户，您的请求无法处理。请咨询餐厅工作人员。",
    tableRequiredError: "需要桌子",
    tableRequiredDesc: "没有有效的桌子无法处理订单。请咨询餐厅工作人员.",

    // Menu loading error messages
    menuLoadingError: "加载菜单时出错",
    menuLoadingErrorDesc: "无法加载菜单。检查您的网络连接。",
    retryLoading: "刷新",
    checkingConnection: "正在检查连接...",
  },
} as const

export function useTranslation(locale: Locale) {
  return {
    t: translations[locale],
    formatPrice: (price: number) => {
      const currency = translations[locale].currency
      const formatted = price.toFixed(2)
      return locale === "es" || locale === "de" || locale === "fr"
        ? `${formatted}${currency}`
        : `${currency}${formatted}`
    },
  }
}

export function useI18n(locale: Locale) {
  const t = (key: string) => {
    const keys = key.split(".")
    let value: any = translations[locale]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return {
    t,
    formatPrice: (price: number) => {
      const currency = translations[locale].currency
      const formatted = price.toFixed(2)
      return locale === "es" || locale === "de" || locale === "fr"
        ? `${formatted}${currency}`
        : `${currency}${formatted}`
    },
  }
}

export function translateAllergen(allergen: string, locale: Locale): string {
  const allergenNames = translations[locale].allergenNames as Record<string, string>
  return allergenNames[allergen] || allergen
}

export function translateCategory(category: string, locale: Locale): string {
  console.log("[v0] translateCategory called:", { category, locale })

  const normalizedCategory = category.toLowerCase().trim()
  console.log("[v0] translateCategory normalized:", normalizedCategory)

  const categoryNames = translations[locale].categoryNames as Record<string, string>

  // Try exact match first
  if (categoryNames[normalizedCategory]) {
    console.log("[v0] translateCategory found exact match:", categoryNames[normalizedCategory])
    return categoryNames[normalizedCategory]
  }

  // Try removing trailing 's' for singular/plural variations
  const singularCategory = normalizedCategory.endsWith("s") ? normalizedCategory.slice(0, -1) : normalizedCategory

  if (categoryNames[singularCategory]) {
    console.log("[v0] translateCategory found singular match:", categoryNames[singularCategory])
    return categoryNames[singularCategory]
  }

  // Try adding 's' for plural variations
  const pluralCategory = normalizedCategory + "s"
  if (categoryNames[pluralCategory]) {
    console.log("[v0] translateCategory found plural match:", categoryNames[pluralCategory])
    return categoryNames[pluralCategory]
  }

  const categoryMap: Record<string, string> = {
    principal: "principales",
    entrante: "entrantes",
    postre: "postres",
    bebida: "bebidas",
    carne: "carnes",
    starter: "entrantes",
    starters: "entrantes",
    main: "principales",
    mains: "principales",
    dessert: "postres",
    desserts: "postres",
    drink: "bebidas",
    drinks: "bebidas",
    meat: "carnes",
    meats: "carnes",
  }

  const mappedCategory = categoryMap[normalizedCategory]
  if (mappedCategory && categoryNames[mappedCategory]) {
    console.log("[v0] translateCategory found mapped match:", categoryNames[mappedCategory])
    return categoryNames[mappedCategory]
  }

  // Return original category if no translation found
  console.log("[v0] translateCategory no match found, returning original:", category)
  return category
}

export function translateDishDescription(description: string, locale: Locale): string {
  // For now, return original description since dishes are only in Spanish
  // In the future, this could be expanded to support multi-language descriptions
  return description
}

export function t(locale: Locale, key: string): string {
  const keys = key.split(".")
  let value: any = translations[locale]

  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}
