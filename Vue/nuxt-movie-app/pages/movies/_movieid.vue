<template>
  <!-- Loading -->
  <Loading v-if="$fetchState.pending" />

  <!-- Movie Info -->
  <div v-else class="single-movie container">
    <NuxtLink class="button" :to="{ name: 'index' }"> Back </NuxtLink>
    <div class="movie-info">
      <div class="movie-img">
        <img
          :src="`https://image.tmdb.org/t/p/w500/${movie.poster_path}`"
          alt=""
        />
      </div>
      <div class="movie-content">
        <h1>名称: {{ movie.title }}</h1>
        <p class="movie-fact tagline">
          <span>标语:</span> "{{ movie.tagline }}"
        </p>
        <p class="movie-fact">
          <span>发行日期:</span>
          {{
            new Date(movie.release_date).toLocaleString('zh-cn', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          }}
        </p>
        <p class="movie-fact"><span>时长:</span> {{ movie.runtime }} minutes</p>
        <p v-show="movie.revenue" class="movie-fact">
          <span>票房:</span>
          {{
            movie.revenue.toLocaleString('en-us', {
              style: 'currency',
              currency: 'USD',
            })
          }}
        </p>
        <p class="movie-fact"><span>简介:</span> {{ movie.overview }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'singleMovie',

  async fetch() {
    await this.getSingleMovie()
  },

  // delay for fetching
  fetchDelay: 1000,

  head() {
    return {
      title: this.movie.title,
    }
  },

  data() {
    return {
      movie: '',
    }
  },
  methods: {
    async getSingleMovie() {
      console.log(
        `https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=31b41729bb377e18471ff58dc70159f5&language=zh-CN`
      )
      const data = axios.get(
        `https://api.themoviedb.org/3/movie/${this.$route.params.id}?api_key=31b41729bb377e18471ff58dc70159f5&language=zh-CN`
      )
      const result = await data
      console.log(result.data);
      this.movie = result.data
    },
  },
}
</script>

<style lang="scss">
.single-movie {
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 16px;

  .button {
    align-self: flex-start;
    margin-bottom: 32px;
  }

  .movie-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    color: #fff;
    @media (min-width: 800px) {
      flex-direction: row;
      align-items: flex-start;
    }
    .movie-img {
      img {
        max-height: 500px;
        width: 100%;

        @media (min-width: 800px) {
          max-height: 700px;
          width: initial;
        }
      }
    }

    .movie-content {
      h1 {
        font-size: 56px;
        font-weight: 400;
      }

      .movie-fact {
        margin-top: 12px;
        font-size: 20px;
        line-height: 1.5;

        span {
          font-weight: 600;
          text-decoration: underline;
        }
      }

      .tagline {
        font-style: italic;
        span {
          font-style: normal;
        }
      }
    }
  }
}
</style>
