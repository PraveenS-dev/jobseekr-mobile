import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NativeWindExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        NativeWind Setup Test 🎉
      </Text>
      
      <View style={styles.cardContainer}>
        {/* Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Colors & Typography
          </Text>
          <Text style={styles.cardText}>
            This card demonstrates various text colors, sizes, and weights.
          </Text>
        </View>

        {/* Card 2 */}
        <View style={styles.gradientCard}>
          <Text style={styles.whiteText}>
            Gradient Background
          </Text>
        </View>

        {/* Card 3 */}
        <View style={styles.successCard}>
          <Text style={styles.successText}>
            Success Message Style
          </Text>
        </View>

        {/* Interactive Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Interactive Button
          </Text>
        </TouchableOpacity>

        {/* Grid Layout */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem1}>
            <Text style={styles.gridText}>Flex 1</Text>
          </View>
          <View style={styles.gridItem2}>
            <Text style={styles.gridText}>Flex 1</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
  cardText: {
    color: '#4b5563',
    fontSize: 14,
  },
  gradientCard: {
    backgroundColor: '#8b5cf6',
    padding: 16,
    borderRadius: 8,
  },
  whiteText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
    padding: 16,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  successText: {
    color: '#166534',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  gridItem1: {
    flex: 1,
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 4,
  },
  gridItem2: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 4,
  },
  gridText: {
    textAlign: 'center',
    color: '#92400e',
  },
});
