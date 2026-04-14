<template>
  <div class="add-listing-step">
    <h1>Nová nabídka</h1>
    <p>Krok 3 z 3</p>

    <div class="form-group">
      <label for="brand">Značka</label>
      <input type="text" id="brand" v-model="brand" placeholder="Např. Bosch, DeWalt..." />
    </div>

    <div class="form-group">
      <label for="model">Model</label>
      <input type="text" id="model" v-model="model" placeholder="Přesné označení modelu" />
    </div>

    <div class="form-group">
      <label for="power">Výkon</label>
      <input type="text" id="power" v-model="power" placeholder="Např. 1500W, 18V..." />
    </div>

    <div class="form-group">
      <label for="weight">Hmotnost</label>
      <input type="text" id="weight" v-model="weight" placeholder="Např. 2.5 kg" />
    </div>

    <div class="form-group">
      <label for="accessories">Příslušenství</label>
      <input type="text" id="accessories" v-model="accessories" placeholder="Např. kufr, náhradní baterie..." />
    </div>

    <div class="form-group">
      <label for="condition">Stav</label>
      <select id="condition" v-model="condition">
        <option value="new">Nový</option>
        <option value="used">Použitý</option>
        <option value="damaged">Poškozený</option>
      </select>
    </div>

    <div class="form-group">
      <label for="additionalParams">Další parametry</label>
      <textarea
        id="additionalParams"
        v-model="additionalParams"
        placeholder="Výkon, rozměry, hmotnost nebo jiné důležité specifikace..."
      ></textarea>
    </div>

    <div class="form-group">
      <label>Způsob vyzvednutí</label>
      <div class="pickup-methods">
        <label>
          <input type="checkbox" v-model="pickupMethods.personal" />
          Osobní předání
        </label>
        <label>
          <input type="checkbox" v-model="pickupMethods.garage" />
          Garáž s kódem
        </label>
        <label>
          <input type="checkbox" v-model="pickupMethods.delivery" />
          Doručení
        </label>
        <label>
          <input type="checkbox" v-model="pickupMethods.other" />
          Jiné
        </label>
      </div>
    </div>

    <div class="form-group">
      <label>Pravidla a omezení</label>
      <div class="rules">
        <label>
          <input type="checkbox" v-model="rules.noModifications" />
          Zákaz provádění jakýchkoliv úprav na předmětu.
        </label>
        <label>
          <input type="checkbox" v-model="rules.purposeOnly" />
          Užívání pouze pro účely, ke kterým je předmět určen.
        </label>
        <label>
          <input type="checkbox" v-model="rules.noThirdParty" />
          Zákaz pronájmu třetím stranám.
        </label>
        <label>
          <input type="checkbox" v-model="rules.depositForfeit" />
          Propadnutí kauce v případě jakéhokoliv poškození.
        </label>
        <label>
          <input type="checkbox" v-model="rules.other" />
          Jiné
        </label>
      </div>
    </div>

    <button @click="submitListing">Zveřejnit nabídku</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const brand = ref('');
const model = ref('');
const power = ref('');
const weight = ref('');
const accessories = ref('');
const condition = ref('new');
const additionalParams = ref('');
const pickupMethods = reactive({
  personal: false,
  garage: false,
  delivery: false,
  other: false,
});
const rules = reactive({
  noModifications: false,
  purposeOnly: false,
  noThirdParty: false,
  depositForfeit: false,
  other: false,
});

function submitListing() {
  console.log('Submitting listing with:', {
    brand: brand.value,
    model: model.value,
    power: power.value,
    weight: weight.value,
    accessories: accessories.value,
    condition: condition.value,
    additionalParams: additionalParams.value,
    pickupMethods,
    rules,
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

.pickup-methods label,
.rules label {
  display: block;
  margin-bottom: 8px;
}
</style>