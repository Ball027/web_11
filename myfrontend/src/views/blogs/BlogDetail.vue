<template>
  <div class="container is-widescreen">
    <section class="section" v-if="this.error">
      <div class="container is-widescreen">
        <div class="notification is-danger">
          {{ error.code + ": " + error.sqlMessage }}
        </div>
      </div>
    </section>
    <div v-else>
      <section class="hero">
        <div class="hero-body">
          <p class="title">
            {{ title }}
          </p>
        </div>
      </section>
      <section class="section" id="app">
        <div class="content">
          <div class="card has-background-light">
            <div class="card-image pt-5">
              <div class="columns" v-for="image in images" :key="image">
                <div class="column">
                  <figure class="image">
                    <img
                      :src="
                        image.file_path
                          ? `http://localhost:3000/` + image.file_path
                          : 'https://bulma.io/images/placeholders/640x360.png'
                      "
                      alt="Placeholder image"
                    />
                  </figure>
                </div>
              </div>
            </div>
            <div class="card-content">
              <div class="content">
                {{ blogs }}
              </div>
              <div class="container">
                <p class="subtitle">Comments</p>
                <div class="box" v-for="comment in comments" :key="comment.id">
                  <article class="media">
                    <div class="media-left">
                      <figure class="image is-64x64">
                        <img
                          :src="
                            comment.file_path
                              ? `http://localhost:3000/` + comment.file_path
                              : 'https://bulma.io/images/placeholders/640x360.png'
                          "
                          alt="Image"
                        />
                      </figure>
                    </div>
                    <div class="media-content">
                      <div class="content">
                        <p>
                          {{ comment.comment }}
                        </p>
                        <p class="is-size-7">
                          {{ comment.comment_date }}
                        </p>
                      </div>
                      <nav class="level is-mobile">
                        <div class="level-left">
                          <a class="level-item" aria-label="like">
                            <span class="icon is-small">
                              <i class="fas fa-heart" aria-hidden="true"></i>
                            </span>
                          </a>
                        </div>
                      </nav>
                    </div>
                  </article>
                </div>
                <div class="field">
                  <label class="label">Add Comment</label>
                  <div class="control">
                    <textarea
                      class="textarea"
                      name="comment"
                      placeholder="Add Comment Here"
                      v-model="newcomment"
                    ></textarea>
                  </div>
                </div>
                <div class="file">
                  <label class="file-label">
                    <input
                      class="file-input"
                      type="file"
                      id="file"
                      ref="file"
                      @change="handleFileUpload()"
                    />
                    <span class="file-cta">
                      <span class="file-icon">
                        <i class="fas fa-upload"></i>
                      </span>
                      <span class="file-label"> Choose an image… </span>
                    </span>
                  </label>
                </div>
                <input
                  class="button is-primary"
                  type="submit"
                  value="Submit"
                  @click="submit()"
                />
              </div>
            </div>
            <footer class="card-footer">
              <a class="card-footer-item" href="/">To Home Page</a>
            </footer>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      title: "",
      blogs: "",
      images: [],
      comments: [],
      error: null,
      newcomment: "",
      file: null,
    };
  },
  created() {
    axios
      .get("http://localhost:3000/blogs/" + this.$route.params.id)
      .then((res) => {
        console.log(res);
        this.title = res.data.blog.title;
        this.blogs = res.data.blog.content;
        this.images = res.data.images;
        this.comments = res.data.comments;
        this.error = res.data.error;
      })
      .catch((err) => {
        console.log(err);
      });
  },
  methods: {
    submit() {
      var formData = new FormData();
      formData.append("comment_image", this.file);
      formData.append("comment", this.newcomment);
      formData.append("comment_by_id", -1);

      axios
        .post(
          "http://localhost:3000/" + this.$route.params.id + "/comments",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          console.log(response);
          location.reload() // Success! -> redirect to home page
        })
        .catch((error) => {
          console.log(error.message);
        });
    },
    handleFileUpload() {
      this.file = this.$refs.file.files[0];
    },
  },
};
</script>