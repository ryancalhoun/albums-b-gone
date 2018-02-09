require 'json'

task default: [:chrome, :edge, :safari]

directory 'build'
directory 'dist'

task :manifest do
  $manifest = JSON.parse(File.read('src/manifest.json'))
  puts "Building version #{$manifest['version']}"
end

task chrome: [:manifest, :dist] do
  Dir.chdir('src') do
    sh "zip ../dist/chrome-#{$manifest['version']}.zip *"
  end
end

task edge: [:manifest, :build, :dist] do
  rm_rf 'build/edgeextension/'
  mkdir_p 'build/edgeextension/manifest/Assets'
  mkdir_p 'build/edgeextension/manifest/Extension'

  manifest = Marshal.load( Marshal.dump($manifest) )

  v = manifest['version'].split '.'
  v << '0' until v.size >= 4
  manifest['version'] = v.join('.')

  manifest.delete 'manifest_version'
  manifest['permissions'].reject! {|x| x == 'activeTab'}
  manifest['permissions'] << "*://*/*"
  manifest['background']['persistent'] = true
  manifest['browser_specific_settings'] = {
    "edge": {
      "browser_action_next_to_addressbar": true
    }
  }
  manifest['browser_action']['default_icon'] = {
    '19': 'albums-b-gone-icon-48b.png',
    '38': 'albums-b-gone-icon-48b.png',
  }

  cp 'edge-manifest/generationInfo.json', 'build/edgeextension/'

  xml = File.read('edge-manifest/AppXManifest.xml')
  manifest.each do |name,val|
    next unless val.is_a?(String)
    xml.gsub! /{{\s*#{name}\s*}}/, val
  end

  File.open('build/edgeextension/manifest/appxmanifest.xml', 'w') do |f|
    f.write xml
  end

  Dir['edge-manifest/*.png'].each do |icon|
    cp icon, 'build/edgeextension/manifest/Assets'
  end
  Dir['src/*'].each do |icon|
    cp icon, 'build/edgeextension/manifest/Extension'
  end

  File.open('build/edgeextension/manifest/Extension/manifest.json', 'w') do |f|
    f.write JSON.pretty_generate(manifest)
  end

  sh 'manifoldjs -l debug -p edgeextension package build/edgeextension/manifest/'
  cp 'build/edgeextension/package/edgeExtension.appx', "dist/albums-b-gone-#{$manifest['version']}.appx"
end

task safari: [:manifest, :build, :dist] do
  mkdir_p 'build/albums-b-gone.safariextension/'
  rm_rf 'build/albums-b-gone.safariextension/*'

  xml = File.read('safari-manifest/Info.plist')
  $manifest.each do |name,val|
    next unless val.is_a?(String)
    xml.gsub! /{{\s*#{name}\s*}}/, val
  end

  File.open('build/albums-b-gone.safariextension/Info.plist', 'w') do |f|
    f.write xml
  end
  cp 'safari-manifest/background.html', 'build/albums-b-gone.safariextension/'

  Dir['src/*'].each do |icon|
    cp icon, 'build/albums-b-gone.safariextension/'
  end
end
