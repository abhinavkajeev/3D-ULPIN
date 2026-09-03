# 3D Cadastre AI/ML Extraction Engine (PyTorch / OpenCV)

> **Status:** Architecture placeholder only. The frontend is fully implemented with simulated pipeline visualization.

## Architecture

```
ml-service/
├── requirements.txt
├── src/
│   ├── app.py                     # FastAPI / Flask inference endpoint
│   ├── models/
│   │   ├── building_detector.py   # YOLOv8 / Segment Anything (SAM) footprint detection
│   │   ├── floor_segmenter.py     # Elevation clustering from LiDAR point clouds
│   │   └── height_estimator.py    # Shadow-based height calculation from satellite imagery
│   ├── pipelines/
│   │   └── extraction_pipeline.py # End-to-end 2D parcel -> 3D building model pipeline
│   └── utils/
│       ├── geo_utils.py           # GeoTIFF / Coordinate projection utilities
│       └── image_utils.py         # Image preprocessing
```
