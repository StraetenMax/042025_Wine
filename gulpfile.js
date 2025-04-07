//const mjml = require('gulp-mjml');
const gulp = require('gulp');
const mjml = require('mjml');
const rename = require('gulp-rename');
const through2 = require('through2');
const liveServer = require('live-server');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');

//Erreur mjml
function handleError (err) {
    console.log(err.toString());
    this.emit('end');
  }

//Tâche pour démarrer le serveur de développement
gulp.task('serve', function(){
    const params = {
        port: 8080,
        root: 'dist',
        open: true,
        file: 'layout.html',
        wait: 1000
    };
    liveServer.start(params);
});

//Tâche pour rendre le template Nunjucks avec les données JSON
gulp.task('nunjucks', function() {
    return gulp.src('src/njk/layout.njk')
        /*.pipe(data(function(){
            return{
                articles: JSON.parse(fs.readFileSync('src/json/articles.json', 'utf8')),
                logos: JSON.parse(fs.readFileSync('src/json/logos.json', 'utf8')),
                breves: JSON.parse(fs.readFileSync('src/json/breves.json', 'utf8')),
            };
        }))*/
        .pipe(nunjucksRender({
            path: ['src/njk']
        }))
        .pipe(rename({ extname: '.mjml' }))
        .pipe(gulp.dest('src/mjml'));
});

//Tâche pour compiler MJML en HTML
gulp.task('mjml', function(){
    console.log('Starting mjml task...');
    return gulp.src('src/mjml/layout.mjml', { allowEmpty: true })
        .pipe(through2.obj(function(file, _, cb) {
            try {
                const { html } = mjml(file.contents.toString());
                file.contents = Buffer.from(html);
                cb(null, file);
            } catch (err) {
                handleError.call(this, err);
            }
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest('dist'))
        .on('end', () => console.log('MJML task completed.'));
});

//Tâche par défaut
gulp.task('default', gulp.series('nunjucks', 'mjml','serve'));