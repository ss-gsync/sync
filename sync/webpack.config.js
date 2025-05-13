const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDashboardOnly = env && env.dashboard;

  // Configure entries based on build type
  const entries = isDashboardOnly 
    ? { dashboard: './src/js/dashboard.js', overview: './src/js/overview.js' }
    : { main: './src/index.js', dashboard: './src/js/dashboard.js', overview: './src/js/overview.js' };

  return {
    entry: entries,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash].js',
      publicPath: '/'
    },
    devtool: isProduction ? false : 'source-map',
    devServer: {
      static: path.join(__dirname, 'dist'),
      port: 8080,
      hot: true,
      historyApiFallback: {
        rewrites: [
          { from: /^\/dashboard/, to: '/dashboard.html' },
          { from: /^\/overview/, to: '/overview.html' }
        ]
      },
      proxy: {
        '/api': {
          target: process.env.API_URL || 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[hash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[hash][ext]'
          }
        }
      ]
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        name: 'vendor'
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      // Only include the main index.html template if not building dashboard-only
      ...(!isDashboardOnly ? [
        new HtmlWebpackPlugin({
          template: './src/index.html',
          filename: 'index.html',
          chunks: ['main', 'vendor'],
          favicon: './src/assets/favicon.ico',
          minify: isProduction,
          meta: {
            'Content-Security-Policy': {
              'http-equiv': 'Content-Security-Policy',
              'content': "default-src 'self'; connect-src 'self' http://localhost:5000; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';"
            }
          }
        })
      ] : []),
      
      // Dashboard HTML template
      new HtmlWebpackPlugin({
        template: './src/dashboard.html',
        filename: 'dashboard.html',
        chunks: ['dashboard', 'vendor'],
        favicon: './src/assets/favicon.ico',
        minify: isProduction,
        meta: {
          'Content-Security-Policy': {
            'http-equiv': 'Content-Security-Policy',
            'content': "default-src 'self'; connect-src 'self' http://localhost:5000; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';"
          }
        }
      }),
      
      // Overview HTML template
      new HtmlWebpackPlugin({
        template: './src/overview.html',
        filename: 'overview.html',
        chunks: ['overview', 'vendor'],
        favicon: './src/assets/dash.ico',
        minify: isProduction,
        meta: {
          'Content-Security-Policy': {
            'http-equiv': 'Content-Security-Policy',
            'content': "default-src 'self'; connect-src 'self' http://localhost:5000; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline';"
          }
        }
      }),
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: './src/assets', to: 'assets' },
          { from: './src/js/jquery.js', to: 'js/jquery.js' }
        ]
      }),
      new webpack.DefinePlugin({
        // Properly stringify the value to make it available as a global in the client
        'APP_VERSION': JSON.stringify(require('./package.json').version || '1.0.0'),
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000')
      })
    ],
    resolve: {
      extensions: ['.js'],
      alias: {
        '@': path.resolve(__dirname, 'src/')
      }
    }
  };
};