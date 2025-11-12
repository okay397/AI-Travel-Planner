// 地图服务模块，用于处理地图显示和行程地点标记

// 支持的地图服务提供商
const MAP_PROVIDERS = {
  NONE: 'none',
  AMAP: 'amap',
  BAIDU: 'baidu'
};

class MapService {
  constructor() {
    this.provider = localStorage.getItem('mapProvider') || MAP_PROVIDERS.NONE;
    this.apiKey = localStorage.getItem('mapApiKey') || '';
    this.mapInstance = null;
    this.markers = [];
    this.isInitialized = false;
    this.loadingPromise = null;
  }

  // 更新地图配置
  updateConfig(config) {
    if (config.provider !== undefined) {
      this.provider = config.provider;
      localStorage.setItem('mapProvider', config.provider);
    }
    if (config.apiKey !== undefined) {
      this.apiKey = config.apiKey;
      localStorage.setItem('mapApiKey', config.apiKey);
    }
    
    // 重置地图实例
    if (this.mapInstance) {
      this.destroyMap();
    }
  }

  // 加载地图脚本
  async loadMapScript() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // 检查是否已加载地图脚本
      if (this.isInitialized) {
        resolve();
        return;
      }

      // 如果没有配置地图服务，返回模拟加载成功
      if (this.provider === MAP_PROVIDERS.NONE) {
        setTimeout(() => {
          this.isInitialized = true;
          resolve();
        }, 100);
        return;
      }

      // 检查是否已有地图脚本
      let scriptId = '';
      let scriptSrc = '';
      let callbackName = '';

      if (this.provider === MAP_PROVIDERS.AMAP) {
        scriptId = 'amap-script';
        callbackName = 'initAMap';
        scriptSrc = `https://webapi.amap.com/maps?v=1.4.15&key=${this.apiKey}&callback=${callbackName}`;
      } else if (this.provider === MAP_PROVIDERS.BAIDU) {
        scriptId = 'baidu-script';
        callbackName = 'initBaiduMap';
        scriptSrc = `https://api.map.baidu.com/api?v=3.0&ak=${this.apiKey}&callback=${callbackName}`;
      }

      // 如果脚本已存在，直接返回
      if (document.getElementById(scriptId)) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // 创建全局回调函数
      window[callbackName] = () => {
        this.isInitialized = true;
        resolve();
      };

      // 创建并加载脚本
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptSrc;
      script.onerror = (error) => {
        console.error('地图脚本加载失败:', error);
        reject(new Error('地图脚本加载失败'));
      };
      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  // 初始化地图
  async initializeMap(containerId, options = {}) {
    try {
      // 显示地图容器，隐藏占位符
      const mapContainer = document.getElementById(containerId);
      const placeholder = document.getElementById('map-placeholder');
      if (mapContainer && placeholder) {
        placeholder.style.display = 'none';
      }

      // 如果没有配置地图服务或API Key，使用模拟地图
      if (this.provider === MAP_PROVIDERS.NONE || !this.apiKey) {
        this.renderMockMap(containerId, options);
        return true;
      }

      // 加载地图脚本
      await this.loadMapScript();

      // 根据提供商初始化地图
      if (this.provider === MAP_PROVIDERS.AMAP) {
        return this.initAMapInstance(containerId, options);
      } else if (this.provider === MAP_PROVIDERS.BAIDU) {
        return this.initBaiduMapInstance(containerId, options);
      }
    } catch (error) {
      console.error('地图初始化失败:', error);
      // 降级到模拟地图
      this.renderMockMap(containerId, options);
      return false;
    }
  }

  // 初始化高德地图实例
  initAMapInstance(containerId, options) {
    try {
      if (window.AMap) {
        const defaultOptions = {
          zoom: 13,
          center: options.center || [116.397428, 39.90923]
        };
        
        this.mapInstance = new window.AMap.Map(containerId, {
          ...defaultOptions,
          ...options
        });

        // 添加控件
        this.mapInstance.addControl(new window.AMap.ToolBar());
        this.mapInstance.addControl(new window.AMap.Scale());

        return true;
      }
    } catch (error) {
      console.error('高德地图初始化失败:', error);
    }
    return false;
  }

  // 初始化百度地图实例
  initBaiduMapInstance(containerId, options) {
    try {
      if (window.BMapGL) {
        const defaultOptions = {
          zoom: 13,
          center: options.center ? new window.BMapGL.Point(options.center[0], options.center[1]) : new window.BMapGL.Point(116.397428, 39.90923)
        };
        
        this.mapInstance = new window.BMapGL.Map(containerId);
        this.mapInstance.centerAndZoom(defaultOptions.center, defaultOptions.zoom);

        // 添加控件
        this.mapInstance.addControl(new window.BMapGL.NavigationControl());
        this.mapInstance.addControl(new window.BMapGL.ScaleControl());
        this.mapInstance.enableScrollWheelZoom(true);

        return true;
      }
    } catch (error) {
      console.error('百度地图初始化失败:', error);
    }
    return false;
  }

  // 渲染模拟地图
  renderMockMap(containerId, options) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;

    // 清空容器
    mapContainer.innerHTML = '';

    // 设置模拟地图样式
    mapContainer.style.backgroundColor = '#f0f2f5';
    mapContainer.style.backgroundImage = `
      linear-gradient(45deg, #e6e6e6 25%, transparent 25%),
      linear-gradient(-45deg, #e6e6e6 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e6e6e6 75%),
      linear-gradient(-45deg, transparent 75%, #e6e6e6 75%)
    `;
    mapContainer.style.backgroundSize = '20px 20px';
    mapContainer.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    mapContainer.style.display = 'flex';
    mapContainer.style.alignItems = 'center';
    mapContainer.style.justifyContent = 'center';
    mapContainer.style.position = 'relative';

    // 添加模拟地图内容
    const mockContent = document.createElement('div');
    mockContent.style.textAlign = 'center';
    mockContent.style.color = '#666';
    mockContent.innerHTML = `
      <i class="fas fa-map-marked-alt" style="font-size: 48px; margin-bottom: 15px; color: #4285f4;"></i>
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 10px 0; color: #333;">${this.provider === MAP_PROVIDERS.NONE ? '地图预览' : '地图服务预览'}</h3>
        <p style="margin: 0;">${this.provider === MAP_PROVIDERS.NONE 
          ? '请在API配置中选择地图服务并输入API Key' 
          : 'API Key 未配置或无效，显示模拟地图'}</p>
        ${options.destination ? `<p style="margin-top: 10px; font-weight: bold; color: #4285f4;">目的地: ${options.destination}</p>` : ''}
      </div>
    `;

    mapContainer.appendChild(mockContent);
    
    // 保存模拟实例
    this.mapInstance = { type: 'mock', container: mapContainer };
  }

  // 添加标记点
  addMarker(position, title, description = '', icon = null) {
    if (!this.mapInstance) return null;

    let marker = null;

    // 根据地图类型添加标记
    if (this.provider === MAP_PROVIDERS.AMAP && window.AMap) {
      const markerOptions = {
        position: position,
        title: title,
        content: description
      };
      
      if (icon) {
        markerOptions.icon = new window.AMap.Icon({
          image: icon,
          size: new window.AMap.Size(36, 36),
          imageSize: new window.AMap.Size(36, 36)
        });
      }
      
      marker = new window.AMap.Marker(markerOptions);
      marker.setMap(this.mapInstance);
      
      // 添加信息窗口
      if (description) {
        const infoWindow = new window.AMap.InfoWindow({
          content: `<div style="padding: 10px;"><h4>${title}</h4><p>${description}</p></div>`,
          offset: new window.AMap.Pixel(0, -30)
        });
        
        marker.on('click', () => {
          infoWindow.open(this.mapInstance, marker.getPosition());
        });
      }

    } else if (this.provider === MAP_PROVIDERS.BAIDU && window.BMapGL) {
      const point = new window.BMapGL.Point(position[0], position[1]);
      
      marker = new window.BMapGL.Marker(point);
      this.mapInstance.addOverlay(marker);
      
      // 设置标题和信息窗口
      marker.setTitle(title);
      
      if (description) {
        const infoWindow = new window.BMapGL.InfoWindow(
          `<div style="padding: 10px;"><h4>${title}</h4><p>${description}</p></div>`
        );
        
        marker.addEventListener('click', () => {
          this.mapInstance.openInfoWindow(infoWindow, point);
        });
      }

    } else if (this.mapInstance.type === 'mock') {
      // 在模拟地图上添加标记
      const markerElement = document.createElement('div');
      markerElement.className = 'mock-marker';
      markerElement.style.position = 'absolute';
      markerElement.style.left = `${position[0]}%`;
      markerElement.style.top = `${position[1]}%`;
      markerElement.style.transform = 'translate(-50%, -50%)';
      markerElement.style.zIndex = 100;
      markerElement.style.cursor = 'pointer';
      
      markerElement.innerHTML = `
        <div style="position: relative;">
          <i class="fas fa-map-marker-alt" style="font-size: 24px; color: #ea4335;"></i>
          <div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; white-space: nowrap; font-size: 12px;">
            ${title}
          </div>
        </div>
      `;
      
      // 添加点击事件
      if (description) {
        markerElement.addEventListener('click', () => {
          alert(`${title}\n${description}`);
        });
      }
      
      this.mapInstance.container.appendChild(markerElement);
      marker = markerElement;
    }

    if (marker) {
      this.markers.push(marker);
    }

    return marker;
  }

  // 标记行程路线
  async markTripRoute(tripPlan) {
    if (!tripPlan || !tripPlan.plan || !tripPlan.plan.length) {
      return false;
    }

    // 显示地图，隐藏占位符
    const placeholder = document.getElementById('map-placeholder');
    if (placeholder) {
      placeholder.style.display = 'none';
    }

    // 初始化地图
    await this.initializeMap('map', { 
      destination: tripPlan.destination 
    });

    // 清除现有标记
    this.clearMarkers();

    // 根据行程计划添加标记
    let dayIndex = 0;
    const positions = [];
    
    // 模拟位置数据（实际应用中应该通过地理编码API获取）
    const mockLocations = {
      '酒店': [25, 35],
      '景点': [45, 55],
      '餐厅': [65, 45],
      '购物中心': [35, 65],
      '机场': [20, 20],
      '车站': [70, 25]
    };

    tripPlan.plan.forEach(day => {
      day.activities.forEach(activity => {
        // 根据活动描述确定位置类型
        let locationType = '景点';
        if (activity.description.includes('酒店') || activity.description.includes('入住')) {
          locationType = '酒店';
        } else if (activity.description.includes('餐厅') || activity.description.includes('午餐') || activity.description.includes('晚餐')) {
          locationType = '餐厅';
        } else if (activity.description.includes('机场')) {
          locationType = '机场';
        } else if (activity.description.includes('购物')) {
          locationType = '购物中心';
        } else if (activity.description.includes('车站') || activity.description.includes('车站')) {
          locationType = '车站';
        }

        // 获取模拟位置（添加一些随机性）
        const basePos = mockLocations[locationType] || [50, 50];
        const randomOffset = () => (Math.random() - 0.5) * 10;
        const position = [
          Math.max(10, Math.min(90, basePos[0] + randomOffset() + (dayIndex * 3))),
          Math.max(10, Math.min(90, basePos[1] + randomOffset()))
        ];
        positions.push(position);

        // 为真实地图提供经纬度（这里使用模拟数据）
        let realPosition;
        if (this.provider === MAP_PROVIDERS.AMAP || this.provider === MAP_PROVIDERS.BAIDU) {
          // 模拟经纬度，实际应该通过地理编码API获取
          const baseLon = 116.39 + (Math.random() - 0.5) * 0.1;
          const baseLat = 39.90 + (Math.random() - 0.5) * 0.1;
          realPosition = [baseLon, baseLat];
        } else {
          realPosition = position;
        }

        // 添加标记
        this.addMarker(
          realPosition,
          `第${day.day}天 - ${activity.time}`,
          `${activity.description}\n${activity.location || '未知位置'}\n${activity.estimatedCost ? '预计费用: ' + activity.estimatedCost + '元' : ''}`,
          null
        );
      });
      dayIndex++;
    });

    // 在真实地图上尝试添加路线（如果有多个点）
    if (this.provider === MAP_PROVIDERS.AMAP && window.AMap && positions.length > 1) {
      this.addPolylineForAMap(positions.map(p => p));
    } else if (this.provider === MAP_PROVIDERS.BAIDU && window.BMapGL && positions.length > 1) {
      this.addPolylineForBaiduMap(positions.map(p => [p[0], p[1]]));
    }

    return true;
  }

  // 为高德地图添加路线
  addPolylineForAMap(path) {
    if (!this.mapInstance || !window.AMap) return;

    const polyline = new window.AMap.Polyline({
      path: path,
      strokeColor: '#4285f4',
      strokeWeight: 5,
      strokeStyle: 'solid',
      strokeOpacity: 0.8
    });
    
    polyline.setMap(this.mapInstance);
  }

  // 为百度地图添加路线
  addPolylineForBaiduMap(path) {
    if (!this.mapInstance || !window.BMapGL) return;

    const points = path.map(p => new window.BMapGL.Point(p[0], p[1]));
    const polyline = new window.BMapGL.Polyline(points, {
      strokeColor: '#4285f4',
      strokeWeight: 5,
      strokeOpacity: 0.8
    });
    
    this.mapInstance.addOverlay(polyline);
  }

  // 清除所有标记
  clearMarkers() {
    if (!this.mapInstance) return;

    this.markers.forEach(marker => {
      if (this.provider === MAP_PROVIDERS.AMAP && marker.setMap) {
        marker.setMap(null);
      } else if (this.provider === MAP_PROVIDERS.BAIDU && this.mapInstance.removeOverlay) {
        this.mapInstance.removeOverlay(marker);
      } else if (marker instanceof HTMLElement) {
        marker.remove();
      }
    });
    
    this.markers = [];
  }

  // 销毁地图实例
  destroyMap() {
    this.clearMarkers();
    
    if (this.provider === MAP_PROVIDERS.AMAP && this.mapInstance && this.mapInstance.destroy) {
      this.mapInstance.destroy();
    } else if (this.provider === MAP_PROVIDERS.BAIDU && this.mapInstance && this.mapInstance.clearOverlays) {
      this.mapInstance.clearOverlays();
    }
    
    this.mapInstance = null;
    this.isInitialized = false;
  }

  // 获取当前地图配置
  getConfig() {
    return {
      provider: this.provider,
      apiKey: this.apiKey,
      isInitialized: this.isInitialized
    };
  }
}

// 导出常量和单例
export { MAP_PROVIDERS };
export const mapService = new MapService();

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', () => {
  // 从 localStorage 加载配置
  const config = {
    provider: localStorage.getItem('mapProvider') || MAP_PROVIDERS.NONE,
    apiKey: localStorage.getItem('mapApiKey') || ''
  };
  
  if (config.provider !== MAP_PROVIDERS.NONE || config.apiKey) {
    mapService.updateConfig(config);
  }
});