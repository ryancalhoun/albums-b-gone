require 'json'

task default: [:chrome, :edge]

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
  rm_rf 'build/*'
  mkdir_p 'build/Assets'
  mkdir_p 'build/Extension'

  manifest = Marshal.load( Marshal.dump($manifest) )
  v = manifest['version'].split '.'
  v << '0' until v.size >= 4
  manifest['version'] = v.join('.')

  xml = File.read('edge-manifest/AppXManifest.xml')
  manifest.each do |name,val|
    next unless val.is_a?(String)
    xml.gsub! /{{\s*#{name}\s*}}/, val
  end

  File.open('build/AppXManifest.xml', 'w') do |f|
    f.write xml
  end

  Dir['edge-manifest/*.png'].each do |icon|
    cp icon, 'build/Assets'
  end
  Dir['src/*'].each do |icon|
    cp icon, 'build/Extension'
  end

  File.open('build/Extension/manifest.json', 'w') do |f|
    f.write JSON.pretty_generate(manifest)
  end
end
