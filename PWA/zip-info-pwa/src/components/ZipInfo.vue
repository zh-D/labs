<template>
  <ion-card v-if="info">
    <ion-card-header>
      <ion-card-subtitle>
        {{ info["post code"] }}
      </ion-card-subtitle>
      <ion-card-subtitle>
        {{ info["places"][0]["place name"] }}
      </ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <ion-list>
        <ion-item>
          <ino-label>
            <strong>State:</strong>
            {{ info["places"][0]["state"] }}
            ({{ info["places"][0]["state abbreviation"] }})
          </ino-label>
        </ion-item>
        <ion-item>
          <ino-label>
            <strong>Latitude:</strong>
            {{ info["places"][0]["latitude"] }}
          </ino-label>
        </ion-item>
        <ion-item>
          <ino-label>
            <strong>Longitude:</strong>
            {{ info["places"][0]["longitude"] }}
          </ino-label>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script>
export default {
  name: "ZipInfo",
  props: ["info"],
};
</script>