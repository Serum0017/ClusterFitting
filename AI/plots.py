# i just want to generate 
# installed packages (so i can uninstall them later): isochrones, numpy, holoviews, hvplot, numba, cmake (in program files)

from isochrones.priors import ChabrierPrior
import numpy as np

from isochrones import get_ichrone
tracks = get_ichrone('mist', tracks=True)

mass, age, feh = (1.03, 9.72, -0.11)

# tracks.generate(mass, age, feh, return_dict=True)  # "accurate=True" makes more accurate, but slower

# Simulate a 1000-star cluster at 8kpc
N = 1000
masses = ChabrierPrior().sample(N)
feh = -1.8
age = np.log10(6e9)  # 6 Gyr
distance = 8000.  # 8 kpc
AV = 0.15

# By default this will return a dataframe
tracks.generate(masses, age, feh, distance=distance, AV=AV)
df = tracks.generate(masses, age, feh, distance=distance, AV=AV)

df = df.dropna()
print(len(df)) # about half of the original simulated stars are nans
df.head()


import holoviews as hv
hv.extension('bokeh')
import hvplot.pandas

df['BP-RP'] = df.BP - df.RP
df.hvplot.scatter('BP-RP', 'G', hover_cols=['mass', 'radius', 'Teff', 'logg', 'eep']).options(invert_yaxis=True, width=600)