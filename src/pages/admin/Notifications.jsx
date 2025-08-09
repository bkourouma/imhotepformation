import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input, Textarea, Select } from '../../components/shared/FormField';
import { notificationsService, entreprisesService, employesService } from '../../services/api';
import { Check, Mail, MessageSquare, Users, Building2 } from 'lucide-react';

export default function Notifications() {
  const [channel, setChannel] = useState('email'); // 'email' | 'whatsapp'
  const [scope, setScope] = useState('entreprise'); // 'entreprise' | 'employe'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targets, setTargets] = useState([]); // list of selected ids
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [entreprises, setEntreprises] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoadingLists(true);
        setError(null);
        const [ents, emps] = await Promise.all([
          entreprisesService.getAll(),
          employesService.getAll(),
        ]);
        if (!ignore) {
          setEntreprises(ents || []);
          setEmployes(emps || []);
        }
      } catch (e) {
        if (!ignore) setError(e.message || 'Erreur lors du chargement des listes');
      } finally {
        if (!ignore) setLoadingLists(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  // Reset selection when scope changes
  useEffect(() => {
    setTargets([]);
  }, [scope]);

  const availableOptions = useMemo(() => {
    if (scope === 'entreprise') {
      return (entreprises || []).map((e) => ({ value: e.id, label: e.raison_sociale }));
    }
    return (employes || []).map((e) => ({ value: e.id, label: `${e.prenom || ''} ${e.nom || ''}`.trim() || e.email }));
  }, [scope, entreprises, employes]);

  const handleToggleTarget = (id) => {
    setTargets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allSelected = targets.length > 0 && targets.length === availableOptions.length;
  const toggleSelectAll = () => {
    if (allSelected) setTargets([]);
    else setTargets(availableOptions.map((o) => o.value));
  };

  const canSend = useMemo(() => {
    // Only require a message; subject is optional and will default for emails
    return Boolean(message.trim());
  }, [message]);

  const handleSend = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const ids = targets;
      if (channel === 'email') {
        const finalSubject = subject.trim() || 'Notification';
        if (scope === 'entreprise') {
          await notificationsService.sendEmailToEnterprises({ ids, subject: finalSubject, message });
        } else {
          await notificationsService.sendEmailToEmployees({ ids, subject: finalSubject, message });
        }
      } else {
        if (scope === 'entreprise') {
          await notificationsService.sendWhatsappToEnterprises({ ids, message });
        } else {
          await notificationsService.sendWhatsappToEmployees({ ids, message });
        }
      }
      setSuccess('Notification envoyée');
    } catch (e) {
      setError(e.message || 'Échec de l’envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Envoyer des notifications par Email ou WhatsApp aux entreprises et aux employés</p>
        </div>
      </div>

      {error && (
        <ErrorMessage title="Erreur" error={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-green-700 border border-green-200">{success}</div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Canal">
            <div className="flex gap-2">
              <Button type="button" variant={channel === 'email' ? 'primary' : 'secondary'} onClick={() => setChannel('email')} className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Button>
              <Button type="button" variant={channel === 'whatsapp' ? 'primary' : 'secondary'} onClick={() => setChannel('whatsapp')} className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </Button>
            </div>
          </FormField>

          <FormField label="Cible">
            <div className="flex gap-2">
              <Button type="button" variant={scope === 'entreprise' ? 'primary' : 'secondary'} onClick={() => setScope('entreprise')} className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Entreprises
              </Button>
              <Button type="button" variant={scope === 'employe' ? 'primary' : 'secondary'} onClick={() => setScope('employe')} className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Employés
              </Button>
            </div>
          </FormField>

          <FormField label="Sélection">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">{targets.length} sélectionné(s) sur {availableOptions.length}</div>
              <Button type="button" variant="secondary" size="sm" onClick={toggleSelectAll}>
                {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
            </div>
          </FormField>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="h-72 overflow-y-auto border rounded-md divide-y">
              {loadingLists ? (
                <div className="h-full flex items-center justify-center"><LoadingSpinner /></div>
              ) : (
                availableOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={targets.includes(opt.value)}
                      onChange={() => handleToggleTarget(opt.value)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                    />
                    <span className="text-sm text-gray-900">{opt.label}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {channel === 'email' && (
              <FormField label="Sujet" required>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de l’email" />
              </FormField>
            )}
            <FormField label="Message" required>
              <Textarea rows={10} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={channel === 'email' ? 'Contenu de l’email (HTML simple pris en charge côté serveur)' : 'Message WhatsApp'} />
            </FormField>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {targets.length === 0 ? 'Aucun destinataire sélectionné' : `${targets.length} destinataire(s) sélectionné(s)`}
              </div>
              <Button onClick={handleSend} disabled={!canSend || loading} className="flex items-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : <Check className="h-4 w-4" />}
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


