const gulp = require('gulp');
const mjml = require('gulp-mjml');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');

//Tâche pour rendre le template Nunjucks avec les données JSON
gulp.task('nunjucks', function() {
    return gulp.src('src/mjml/layout.njk')
        /*.pipe(data(function(){
            return{
                articles: JSON.parse(fs.readFileSync('src/json/articles.json', 'utf8')),
                logos: JSON.parse(fs.readFileSync('src/json/logos.json', 'utf8')),
                breves: JSON.parse(fs.readFileSync('src/json/breves.json', 'utf8')),
            };
        }))*/
        .pipe(nunjucksRender({
            path: ['src/mjml']
        }))
        .pipe(gulp.dest('dist'));
});

//Tâche pour compiler MJML en HTML
gulp.task('mjml', function(){
    console.log('Starting mjml task...');
    return gulp.src('dist/layout.mjml',{ allowEmpty: true } )
        .pipe(mjml({
            beautify: false,
            validationLevel: 'strict',
            keepComments: false
        }))
        .pipe(gulp.dest('dist'))
        .on('end', () => console.log('MJML task completed.'));
});

//Tâche par défaut
gulp.task('default', gulp.series('nunjucks', 'mjml'));