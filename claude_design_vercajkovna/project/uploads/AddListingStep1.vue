<template>
  <div class="add-listing-step">
    <h1>Nová nabídka</h1>
    <p>Krok 1 z 3</p>
    <div class="form-group">
      <label for="itemPhotos">Fotografie předmětu</label>
      <input type="file" id="itemPhotos" multiple @change="handleFileUpload" />
      <p>Nahrajte alespoň 1 fotografii</p>
    </div>

    <div class="form-group">
      <label for="itemName">Název předmětu</label>
      <input type="text" id="itemName" v-model="itemName" placeholder="Co dnes pronajímáte?" />
    </div>

    <div class="form-group">
      <label>Kategorie</label>
      <div class="categories">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>
    </div>

    <button @click="goToNextStep">Pokračovat</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const itemName = ref('');
const selectedCategory = ref('');
const categories = [
  { id: 'kutilstvi', label: 'Kutilství' },
  { id: 'zabava', label: 'Zábava' },
  { id: 'sport', label: 'Sport' },
  { id: 'elektronika', label: 'Elektronika' },
  { id: 'domacnost', label: 'Domácnost' },
  { id: 'ostatni', label: 'Ostatní' },
];

function handleFileUpload(event) {
  const files = event.target.files;
  console.log('Uploaded files:', files);
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId;
}

function goToNextStep() {
  console.log('Proceeding to step 2 with:', { itemName: itemName.value, selectedCategory: selectedCategory.value });
}
</script>

<style scoped>
.add-listing-step {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.categories button {
  margin-right: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.categories button.active {
  background-color: #000;
  color: #fff;
}
</style>