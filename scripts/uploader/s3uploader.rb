#!/usr/bin/env ruby

require 'optparse'
require 'ostruct'
require_relative 'content_type_map'

config = OpenStruct.new

# defaults
config.dryrun = false

# Parse environment, will be clobbered by options if passed.
config.dryrun = true if ENV['DRYRUN'] == "true"
config.source = ENV['SOURCE']
config.target = ENV['TARGET']

OptionParser.new do |opts|
  opts.banner = "Usage: #{opts.program_name}.rb [config]"

  opts.separator ""
  opts.separator "Dependencies:"
  opts.separator "1. Requires AWS CLI to be installed and working."
  opts.separator "2. Requires AWS Credentials to be exported or passed through"
  opts.separator "   the 'profile' argument."

  opts.separator ""
  opts.separator "Options:"

  opts.on("-s", "--source SOURCE", String, "Source directory to upload") do |s|
    config.source = s
  end

  opts.on("-t", "--target TARGET", String, "Target location for upload") do |t|
    config.target = t
  end

  opts.on("-p", "--profile [PROFILE]", String, "AWS Credentials profile, uses exported AWS Credentials if missing") do |p|
    config.profile = p
  end

  opts.on("-e", "--extension [EXT]", String, "File extension to upload (defaults to all)") do |e|
    config.extension = e
  end

  opts.on("-D", "--dryrun", "Pass a dry run to AWS CLI") do
    config.dryrun = true
  end

  opts.on_tail("-h", "--help", "Show this message") do
    puts opts.help
    exit
  end

  opts.on_tail do
    abort opts.help if config.source.nil? || config.target.nil?
  end
end.parse!

unless config.target.start_with?("s3://bootstrap-cdn/")
  config.target = "s3://bootstrap-cdn/#{config.target}"
end

dryrun = ""
if config.dryrun
  dryrun = "--dryrun"
end

profile = ""
unless config.profile.nil?
  profile = "--profile #{config.profile}"
end

Dir["#{config.source}/**/*"]
  .reject  { |item| File.directory?(item) } # reject directories
  .collect { |item| item.split(".").last }  # only need exts
  .uniq.each do |ext|                       # iterate over unique ext

  next if !config.extension.nil? && ext != config.extension

  content_type = CONTENT_TYPE_MAP[ext]

  next if content_type.nil?
  #abort "unsupported ext: #{ext}" if content_type.nil?

  command = <<EOF
aws #{profile} s3 cp #{dryrun} --acl public-read \\
  --exclude "*" --include "*.#{ext}" \\
  --metadata-directive="REPLACE" --recursive \\
  --content-type "#{content_type}" \\
  #{config.source} \\
  #{config.target}
EOF

  puts "+ #{command}"
  puts `#{command}`
  puts " "
end
