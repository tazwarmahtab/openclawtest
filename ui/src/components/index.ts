import './proxy-app.js';
import { gatewayService } from '../services/gateway.service.js';

// Attempt live gateway connection (gracefully fails when not running)
gatewayService.connect();
