import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF' },
  header: { marginBottom: 25, borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 15 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  jobTitle: { fontSize: 12, color: '#2563eb', marginTop: 4, fontWeight: 'bold' },
  contactLine: { fontSize: 9, color: '#6b7280', marginTop: 8 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 3 },
  item: { marginBottom: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 11, fontWeight: 'bold', color: '#1f2937' },
  itemSub: { fontSize: 9, color: '#4b5563', marginTop: 2 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillBadge: { paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#eff6ff', borderRadius: 4, fontSize: 8, color: '#1d4ed8', borderWeight: 1, borderColor: '#dbeafe' },
  watermark: { position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: 1 }
});

const SilverCVTemplate = ({ profile, user, username }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile?.full_name || username}</Text>
        <Text style={styles.jobTitle}>{profile?.target_job || 'Développeur Full-Stack'}</Text>
        <Text style={styles.contactLine}>
          {profile?.location} • {user?.email} • SilverJobs Profile: /p/{username}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences</Text>
        <View style={styles.skillContainer}>
          {profile?.skills?.map((skill, i) => (
            <Text key={i} style={styles.skillBadge}>{skill}</Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expériences & Projets</Text>
        {profile?.projects?.map((proj, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTitle}>{proj.name}</Text>
            <Text style={styles.itemSub}>{proj.tech || proj.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Formation</Text>
        {profile?.educations?.map((edu, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTitle}>{edu.degree}</Text>
            <Text style={styles.itemSub}>{edu.school} • {edu.year}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.watermark}>Document certifié authentique par SilverJobs</Text>
    </Page>
  </Document>
);

export default SilverCVTemplate;