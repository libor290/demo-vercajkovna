<template>
  <div>
    <component :is="currentStepComponent" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AddListingStep1 from '@/components/AddListingStep1.vue';
import AddListingStep2 from '@/components/AddListingStep2.vue';
import AddListingStep3 from '@/components/AddListingStep3.vue';

const currentStep = ref(1);

const steps = [
  AddListingStep1,
  AddListingStep2,
  AddListingStep3,
];

const currentStepComponent = computed(() => steps[currentStep.value - 1]);

function goToNextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++;
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}
</script>

<style scoped>
/* Add any global styles for the Add Listing flow here */
</style>