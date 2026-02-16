import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';
import { spacing } from '@/src/theme/spacing';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { ContactCard } from '@/src/components/contact/ContactCard';
import { ContactForm } from '@/src/components/contact/ContactForm';
import { APP_CONFIG } from '@/src/utils/constants';
import { figmaScale, scaledIcon, ms } from '@/src/utils/scaling';

interface MockContact {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
}

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<MockContact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<MockContact | null>(null);

  const handleAddContact = (data: {
    name: string;
    phone: string;
    email: string;
    isPrimary: boolean;
    notifyBySms: boolean;
    notifyByPush: boolean;
  }) => {
    const newContact: MockContact = {
      id: Date.now().toString(),
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      isPrimary: data.isPrimary,
    };
    setContacts((prev) => [...prev, newContact]);
    setShowForm(false);
  };

  const handleDeleteContact = (contactId: string) => {
    Alert.alert(
      'Supprimer le contact',
      'Etes-vous sur de vouloir supprimer ce contact de confiance ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setContacts((prev) => prev.filter((c) => c.id !== contactId));
          },
        },
      ]
    );
  };

  const handleEditContact = (contact: MockContact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const canAddMore = contacts.length < APP_CONFIG.MAX_TRUSTED_CONTACTS;

  return (
    <View style={styles.container}>
      {/* Background ellipse */}
      <View style={styles.ellipseContainer}>
        <View style={styles.ellipse} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + spacing[4] }]}>
        <Text style={styles.title}>Contacts de confiance</Text>
        <Text style={styles.subtitle}>
          {contacts.length}/{APP_CONFIG.MAX_TRUSTED_CONTACTS} contacts configures
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="people-outline" size={scaledIcon(48)} color={colors.primary[400]} />
          </View>
          <Text style={styles.emptyTitle}>Aucun contact</Text>
          <Text style={styles.emptyDescription}>
            Ajoutez des personnes de confiance qui seront prevenues en cas d'alerte
          </Text>
          <Button
            title="Ajouter un contact"
            onPress={() => setShowForm(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContactCard
                name={item.name}
                phone={item.phone}
                email={item.email}
                isPrimary={item.isPrimary}
                onPress={() => handleEditContact(item)}
                onDelete={() => handleDeleteContact(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
          {canAddMore && (
            <View style={styles.addButtonContainer}>
              <Button
                title="Ajouter un contact"
                onPress={() => {
                  setEditingContact(null);
                  setShowForm(true);
                }}
                fullWidth
              />
            </View>
          )}
        </>
      )}

      <Modal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContact(null);
        }}
        title={editingContact ? 'Modifier le contact' : 'Nouveau contact'}
      >
        <ContactForm
          initialValues={
            editingContact
              ? {
                  name: editingContact.name,
                  phone: editingContact.phone,
                  email: editingContact.email ?? '',
                  isPrimary: editingContact.isPrimary,
                }
              : undefined
          }
          onSubmit={handleAddContact}
          onCancel={() => {
            setShowForm(false);
            setEditingContact(null);
          }}
          submitLabel={editingContact ? 'Enregistrer' : 'Ajouter'}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[950],
  },
  ellipseContainer: {
    position: 'absolute',
    top: figmaScale(-400),
    left: figmaScale(-500),
    width: figmaScale(1386),
    height: figmaScale(1278),
    overflow: 'hidden',
  },
  ellipse: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary[400],
    borderRadius: figmaScale(700),
    opacity: 0.5,
    transform: [{ rotate: '3deg' }],
  },
  header: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    ...typography.h2,
    color: colors.white,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.primary[200],
    marginTop: spacing[1],
  },
  listContent: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[20],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[10],
  },
  emptyIconContainer: {
    width: ms(80, 0.5),
    height: ms(80, 0.5),
    borderRadius: ms(80, 0.5) / 2,
    backgroundColor: 'rgba(44, 65, 188, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.white,
  },
  emptyDescription: {
    ...typography.body,
    color: colors.primary[200],
    textAlign: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  emptyButton: {
    minWidth: ms(200, 0.5),
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing[6],
    backgroundColor: colors.primary[950],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
