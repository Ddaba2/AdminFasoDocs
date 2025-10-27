import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (args: any) => bootstrapApplication(App, config, args);

export default bootstrap;
