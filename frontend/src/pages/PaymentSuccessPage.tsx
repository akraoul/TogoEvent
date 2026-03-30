import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon,
  TicketIcon,
  ArrowRightIcon,
  QrCodeIcon,
  ShareIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface PaymentSuccessState {
  paymentId: string;
  transactionId: string;
  event: any;
  selectedTickets: { [key: string]: number };
  totalPrice: number;
}

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentSuccessState;

  if (!state) {
    navigate('/');
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDownloadTicket = () => {
    // Simuler le téléchargement du billet
    const ticketData = {
      paymentId: state.paymentId,
      transactionId: state.transactionId,
      event: state.event,
      selectedTickets: state.selectedTickets,
      totalPrice: state.totalPrice
    };
    
    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billet-${state.paymentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'J\'ai acheté des billets pour ' + state.event.title,
          text: `Rejoignez-moi à ${state.event.title} !`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-orange-500 hover:text-orange-600">
            <HomeIcon className="w-5 h-5" />
            Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Message de succès */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Paiement réussi !
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                Votre commande a été traitée avec succès. Vous recevrez une confirmation par SMS et email.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-green-700 font-medium">ID de paiement</p>
                    <p className="text-green-900 font-bold">{state.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700 font-medium">ID de transaction</p>
                    <p className="text-green-900 font-bold">{state.transactionId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de la commande */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Billets */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TicketIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-xl font-bold">Vos billets</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={state.event.cover_image}
                        alt={state.event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {state.event.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(state.event.start_date).toLocaleDateString('fr-TG', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm text-gray-600">{state.event.venue.name}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Billets achetés</h4>
                      <div className="space-y-2">
                        {Object.entries(state.selectedTickets).map(([ticketTypeId, quantity]) => {
                          const ticketType = state.event.ticket_types?.find((t: any) => t.id === ticketTypeId);
                          if (!ticketType || quantity === 0) return null;
                          return (
                            <div key={ticketTypeId} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{quantity} × {ticketType.name}</p>
                                <p className="text-sm text-gray-600">{ticketType.description}</p>
                              </div>
                              <p className="font-bold text-orange-600">
                                {formatPrice(ticketType.price * quantity)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total payé</span>
                        <span className="text-2xl font-bold text-orange-600">
                          {formatPrice(state.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold text-orange-800 mb-2">Comment utiliser vos billets</h4>
                  <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
                    <li>Présentez ce QR Code à l'entrée de l'événement</li>
                    <li>Le QR Code sera également envoyé par SMS au format numérique</li>
                    <li>Vous pouvez télécharger vos billets en format PDF</li>
                    <li>Conservez une copie de votre confirmation de paiement</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 className="text-lg font-bold mb-4">QR Code d'accès</h3>
                
                <div className="text-center mb-6">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                    <QrCodeIcon className="w-24 h-24 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Code: {state.paymentId}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-600">Valide</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadTicket}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Télécharger le billet
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <ShareIcon className="w-5 h-5" />
                    Partager
                  </button>
                  
                  <Link
                    to="/account"
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <TicketIcon className="w-5 h-5" />
                    Voir tous mes billets
                  </Link>
                </div>
                
                {/* Support */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Besoin d'aide ?</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <strong>WhatsApp:</strong> +22890123456
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong> support@togoevents.tg
                    </p>
                    <p className="text-gray-600">
                      <strong>Service client:</strong> 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions supplémentaires */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-bold mb-4">Que faire maintenant ?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/account"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TicketIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Voir mes billets</h4>
                  <p className="text-sm text-gray-600">Accédez à tous vos billets</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
              
              <Link
                to="/"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Explorer d'autres événements</h4>
                  <p className="text-sm text-gray-600">Découvrez de nouvelles expériences</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </Link>
              
              <a
                href="tel:+22890123456"
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TicketIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Contacter le support</h4>
                  <p className="text-sm text-gray-600">Une question ? Nous sommes là</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
