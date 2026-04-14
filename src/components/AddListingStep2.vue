<template>
  <div class="add-listing-step">
    <h1>Nastavení pronájmu</h1>
    <p>Krok 2 z 3</p>

    <div class="form-group">
      <label for="pricePerDay">Cena za den</label>
      <input type="number" id="pricePerDay" v-model="pricePerDay" placeholder="0" />
    </div>

    <div class="form-group">
      <label for="deposit">Vratná kauce</label>
      <input type="checkbox" id="deposit" v-model="hasDeposit" />
      <input
        v-if="hasDeposit"
        type="number"
        id="depositAmount"
        v-model="depositAmount"
        placeholder="0"
      />
    </div>

    <div class="form-group">
      <label for="availability">Dostupnost pro vypůjčení</label>
      <input type="date" id="availability" v-model="availability" />
    </div>

    <div class="form-group">
      <label for="location">Lokalita předmětu</label>
      <select id="location" v-model="location">
        <option value="profile">Stejná jako v profilu</option>
        <option value="custom">Jiná adresa</option>
      </select>
      <div v-if="location === 'custom'">
        <input type="text" v-model="customAddress.street" placeholder="Ulice a číslo popisné" />
        <input type="text" v-model="customAddress.city" placeholder="Město" />
        <input type="text" v-model="customAddress.zip" placeholder="PSČ" />
      </div>
    </div>

    <button @click="goToNextStep">Pokračovat</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const pricePerDay = ref(0);
const hasDeposit = ref(false);
const depositAmount = ref(0);
const availability = ref('');
const location = ref('profile');
const customAddress = reactive({
  street: '',
  city: '',
  zip: '',
});

function goToNextStep() {
  console.log('Proceeding to step 3 with:', {
    pricePerDay: pricePerDay.value,
    hasDeposit: hasDeposit.value,
    depositAmount: depositAmount.value,
    availability: availability.value,
    location: location.value,
    customAddress,
  });
}
</script>

<style scoped>
.add-listing-step {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}
</style>