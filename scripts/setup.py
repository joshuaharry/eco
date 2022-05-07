#!/usr/bin/env python3
import os
import shutil
from pathlib import Path 

ROOT = os.path.dirname(os.path.dirname(__file__))

PROJECT_STRATEGIES = os.path.join(ROOT, "strategies")

ECO_DIR = os.path.join(Path.home(), ".eco")

ECO_STRATEGIES = os.path.join(ECO_DIR, "strategies")

Path(ECO_DIR).mkdir(parents=True, exist_ok=True)

if not os.path.exists(ECO_STRATEGIES):
    shutil.copytree(PROJECT_STRATEGIES, ECO_STRATEGIES)
