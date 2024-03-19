#@title Installs and Imports
#%%capture
# !pip install --pre astroquery[all]
from astroquery.gaia import GaiaClass
from astroquery.gaia import Gaia
import astropy.units as u
from astropy.coordinates import SkyCoord
from astropy.time import Time
import math
# from prettytable import PrettyTable
import numpy
import matplotlib.pyplot as plt
import numpy as np
from astroquery.mast import Catalogs
import bokeh.plotting as bk
import matplotlib as mpl
from bokeh.layouts import column
from bokeh.plotting import figure, output_file, show, output_notebook
from bokeh.models import Range1d, Label, Title, HoverTool, ColumnDataSource, Slider, CustomJS
import warnings
from bokeh.util.warnings import BokehUserWarning
import pandas as pd
bk.output_notebook()
# %matplotlib inline

def get_Gaia_data(coord):
  ra = coord.ra.degree
  dec = coord.dec.degree
  search_radius = 0.4  # search radius in degrees

  job = Gaia.launch_job_async(f"""
SELECT
    source_id, ra, dec, parallax, phot_g_mean_mag as gmag, bp_rp, pmra, pmdec
FROM
    gaiaedr3.gaia_source
WHERE
    CONTAINS(
        POINT('ICRS', gaiaedr3.gaia_source.ra, gaiaedr3.gaia_source.dec),
        CIRCLE('ICRS', {ra}, {dec}, {search_radius})
    ) = 1
""")

  result = job.get_results()
  df = result.to_pandas()

  mean_pmra = df['pmra'].mean()
  std_pmra = df['pmra'].std()
  mean_pmdec = df['pmdec'].mean()
  std_pmdec = df['pmdec'].std()
  
  filtered_df = df[
    (df['pmra'] > mean_pmra - 3*std_pmra) & (df['pmra'] < mean_pmra + 3*std_pmra) &
    (df['pmdec'] > mean_pmdec - 3*std_pmdec) & (df['pmdec'] < mean_pmdec + 3*std_pmdec)
  ].copy()
  filtered_df['pmra'] = filtered_df['pmra'].astype('float32')
  filtered_df['pmdec'] = filtered_df['pmdec'].astype('float32')

# #   num_stars = len(filtered_df)
  # return [filtered_df['pmra'], filtered_df['pmdec'], [ra, dec]]
  return [filtered_df['pmra'], filtered_df['pmdec'], filtered_df['bp_rp'], filtered_df['gmag'], [ra, dec]]
  # return [df['ra'], df['dec'], [ra, dec]]
  # return [df['bp_rp'], df['gmag']]
#   source = ColumnDataSource(filtered_df)
#   return num_stars, source

#############################################

warnings.filterwarnings('ignore', category=BokehUserWarning)

# NGC 2264
coord = SkyCoord('06h41m00s', '+09d53m00s', frame='icrs')

# ASCC 105
# coord = SkyCoord('19h41m45s', '+27d22m47s', frame='icrs')

# NGC 6325
# coord = SkyCoord('17h17m59.27s', '−23d45m57.7s', frame='icrs')

# Berkely 17
# coord = SkyCoord('5h20m37s', '−30d35m12s', frame='icrs')

# num_stars, source = get_Gaia_data(coord)

def get_Gaia_data_js_wrapper():
  return get_Gaia_data(coord)