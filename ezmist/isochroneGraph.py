from ezmist.py import ezmist
import matplotlib.pyplot as plt
isochrones = ezmist.get_t_isochrones(6.0, 7.0, 0.05, FeH_value=0.0, theory_output='full')

print(isochrones)
# plt.scatter(isochrones['logT'], isochrones['logL'], c=isochrones['logA'], edgecolor='None')
# plt.xlabel('log(Temperature)')
# plt.ylabel('log(Luminosity)')
# plt.colorbar(label='log(Age)')
# plt.title('Isochrone')
# plt.show()