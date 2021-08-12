<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>ZipInfo1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">ZipInfo</ion-title>
        </ion-toolbar>
      </ion-header>

      <ZipSearch v-on:get-zip="getZipInfo" />
      <ZipInfo v-bind:info="info" />
      <ClearInfo v-bind:info="info" v-on:clear-info="clearInfo" />
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import ZipSearch from "@/components/ZipSearch.vue";
import ZipInfo from "@/components/ZipInfo.vue";
import ClearInfo from "@/components/ClearInfo.vue";
import { alertController } from "@ionic/vue";

export default {
  name: "Tab1",
  components: {
    ZipSearch,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    ZipInfo,
    ClearInfo,
  },
  data() {
    return {
      info: null,
    };
  },
  methods: {
    async getZipInfo(zip) {
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (res.status == 404) {
        this.showAlert();
      }
      this.info = await res.json();
    },
    clearInfo() {
      this.info = null;
    },
    async showAlert() {
      return alertController
        .create({
          header: "Enter Zipcode",
          message: "Please enter a valid US zipcode",
          buttons: ["OK"],
        })
        .then((a) => a.present());
    },
  },
};
</script>