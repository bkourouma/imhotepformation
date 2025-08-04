import { Link } from 'react-router-dom';
import { BookOpen, UserCheck, Calendar, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import Button from './Button';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

export default function WelcomeGuide({ companyName }) {
  const { isAuthenticated: isAdmin } = useAdminAuth();

  const allSteps = [
    {
      icon: BookOpen,
      title: 'Découvrez nos formations',
      description: 'Parcourez notre catalogue de formations professionnelles',
      action: 'Voir les formations',
      link: '/formations',
      color: 'bg-orange-500',
      adminOnly: true
    },
    {
      icon: UserCheck,
      title: 'Inscrivez-vous',
      description: 'Sélectionnez une formation et inscrivez vos collaborateurs',
      action: 'Créer une inscription',
      link: '/inscriptions/new',
      color: 'bg-green-500'
    },
    {
      icon: Calendar,
      title: 'Planifiez vos formations',
      description: 'Choisissez les dates qui conviennent à votre équipe',
      action: 'Voir mes inscriptions',
      link: '/inscriptions',
      color: 'bg-purple-500'
    }
  ];

  // Filtrer les étapes selon le statut admin
  const steps = allSteps.filter(step => !step.adminOnly || isAdmin);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bienvenue {companyName} ! 🎉
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-gray-600">
            Vous venez de rejoindre notre plateforme de formations. Voici comment commencer :
          </p>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                <div className={`p-2 rounded-lg ${step.color}`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <Button
                    as={Link}
                    to={step.link}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-orange-600"
                  >
                    {step.action}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">
              💡 Conseil
            </h4>
            <p className="text-sm text-orange-700">
              {isAdmin ? (
                <>Commencez par explorer nos formations pour trouver celles qui correspondent
                aux besoins de votre équipe. Vous pourrez ensuite créer vos premières inscriptions
                en quelques clics !</>
              ) : (
                <>Commencez par créer une inscription pour vos collaborateurs.
                Vous pourrez ensuite suivre l'avancement de vos formations et planifier
                les prochaines sessions !</>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
