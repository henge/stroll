class HomeController < ApplicationController
  def index
    @current_order = current_user.current;
  end
end
