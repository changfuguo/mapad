
fis.set('namespace','mabox');

 
fis.set('project.files',['**','.**','.**/**'])
	.set('project.ignore',['**/_*.scss','.svn/**','fis-conf.js','BCLOUD','build.sh',"**.swp"])
	.set('pack',{
		'/base/mabox.js':[
			'/base/core.js',
			'/base/cookie.js',
			'/base/utils.js',
			'/base/url.js',
			'/base/bridge.js'
		]
	});

fis.match('*.js',{
	useHash: true,
	optimizer: fis.plugin('uglify-js', {})
});
